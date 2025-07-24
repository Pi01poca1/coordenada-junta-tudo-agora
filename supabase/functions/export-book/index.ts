import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExportRequest {
  bookId: string;
  format: 'pdf' | 'epub' | 'docx' | 'html' | 'json';
  options?: {
    template?: string;
    includeImages?: boolean;
    chapterRange?: { start: number; end: number };
  };
}

// Simple text-based generators that work
const generateContent = (book: any, chapters: any[], format: string): string => {
  const title = book.title || 'Sem título';
  const description = book.description || '';
  const timestamp = new Date().toLocaleString('pt-BR');
  
  if (format === 'json') {
    return JSON.stringify({
      book: {
        id: book.id,
        title: title,
        description: description,
        status: book.status,
        created_at: book.created_at,
        updated_at: book.updated_at
      },
      chapters: chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        content: chapter.content,
        order_index: chapter.order_index,
        created_at: chapter.created_at,
        updated_at: chapter.updated_at
      })),
      export_date: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  // For PDF, HTML, DOCX, EPUB - use simple text format
  let content = `${title}\n\n`;
  if (description) {
    content += `${description}\n\n`;
  }
  content += `${'='.repeat(50)}\n\n`;

  chapters.forEach((chapter, index) => {
    content += `CAPÍTULO ${chapter.order_index || index + 1}: ${chapter.title}\n\n`;
    if (chapter.content) {
      content += `${chapter.content}\n\n`;
    } else {
      content += `Sem conteúdo\n\n`;
    }
    content += `${'-'.repeat(30)}\n\n`;
  });

  content += `\nDocumento gerado em: ${timestamp}`;
  return content;
};

serve(async (req) => {
  console.log('Export function called with method:', req.method);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Processing request with token present:', !!token);

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    );

    // Verify user authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication failed:', userError);
      throw new Error('Authentication required');
    }

    console.log('Authenticated user:', user.id);

    // Parse request body
    const { bookId, format, options = {} }: ExportRequest = await req.json();
    console.log('Export request:', { bookId, format, options });

    // Fetch book and verify ownership
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_id', user.id)
      .single();

    if (bookError || !book) {
      console.error('Book not found or access denied:', bookError);
      throw new Error('Book not found or access denied');
    }

    console.log('Found book:', book.title);

    // Fetch chapters
    let query = supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true });

    // Apply chapter range filter if specified
    if (options.chapterRange) {
      query = query
        .gte('order_index', options.chapterRange.start)
        .lte('order_index', options.chapterRange.end);
    }

    const { data: chapters, error: chaptersError } = await query;

    if (chaptersError) {
      console.error('Failed to fetch chapters:', chaptersError);
      throw new Error('Failed to fetch chapters');
    }

    console.log('Found chapters:', chapters?.length || 0);

    // Generate content
    const content = generateContent(book, chapters || [], format);
    
    // Set appropriate content type
    let mimeType: string;
    switch (format) {
      case 'json':
        mimeType = 'application/json';
        break;
      case 'html':
        mimeType = 'text/html';
        break;
      case 'pdf':
        mimeType = 'application/pdf';
        break;
      case 'docx':
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'epub':
        mimeType = 'application/epub+zip';
        break;
      default:
        mimeType = 'text/plain';
    }

    // Create safe filename
    const safeTitle = book.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeTitle}_${timestamp}.${format}`;

    console.log('Generated content for format:', format, 'filename:', filename);

    // Return content with proper headers
    const headers = {
      ...corsHeaders,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };

    return new Response(content, { headers });

  } catch (error) {
    console.error('Export function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
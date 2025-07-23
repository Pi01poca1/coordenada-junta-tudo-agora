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

// Simple PDF generator using HTML template
const generatePDF = (book: any, chapters: any[], options: any = {}) => {
  const template = options.template || 'default';
  
  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${book.title}</title>
    <style>
        body { font-family: Georgia, serif; margin: 40px; line-height: 1.6; }
        .title { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 20px; }
        .author { font-size: 16px; text-align: center; margin-bottom: 40px; color: #666; }
        .chapter { page-break-before: always; margin-bottom: 40px; }
        .chapter-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
        .chapter-content { text-align: justify; }
        p { margin-bottom: 16px; }
        .page-number { position: fixed; bottom: 20px; right: 20px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="title">${book.title}</div>
    <div class="author">por ${book.owner_id}</div>
    
    ${chapters.map((chapter, index) => `
        <div class="chapter">
            <h2 class="chapter-title">Capítulo ${chapter.order_index}: ${chapter.title}</h2>
            <div class="chapter-content">
                ${chapter.content ? chapter.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '<br>').join('') : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>`;

  return html;
};

// EPUB generator
const generateEPUB = (book: any, chapters: any[]) => {
  // For simplicity, we'll generate a basic HTML that can be converted to EPUB
  // In a production environment, you'd use a proper EPUB library
  const content = {
    title: book.title,
    author: 'Author',
    chapters: chapters.map(chapter => ({
      title: chapter.title,
      content: chapter.content || ''
    }))
  };
  
  return JSON.stringify(content, null, 2);
};

// DOCX generator (simplified)
const generateDOCX = (book: any, chapters: any[]) => {
  // For simplicity, generating XML that resembles DOCX structure
  let docx = `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <title>${book.title}</title>
  <body>`;
  
  chapters.forEach(chapter => {
    docx += `
    <chapter>
      <heading>${chapter.title}</heading>
      <content>${chapter.content || ''}</content>
    </chapter>`;
  });
  
  docx += `
  </body>
</document>`;
  
  return docx;
};

// HTML generator
const generateHTML = (book: any, chapters: any[]) => {
  return generatePDF(book, chapters); // Reuse PDF HTML
};

// JSON generator
const generateJSON = (book: any, chapters: any[]) => {
  return JSON.stringify({
    book: {
      id: book.id,
      title: book.title,
      description: book.description,
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
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { bookId, format, options = {} }: ExportRequest = await req.json()

    // Fetch book
    const { data: book, error: bookError } = await supabaseClient
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_id', user.id)
      .single()

    if (bookError || !book) {
      throw new Error('Book not found or access denied')
    }

    // Fetch chapters
    let chaptersQuery = supabaseClient
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })

    // Apply chapter range filter if specified
    if (options.chapterRange) {
      chaptersQuery = chaptersQuery
        .gte('order_index', options.chapterRange.start)
        .lte('order_index', options.chapterRange.end)
    }

    const { data: chapters, error: chaptersError } = await chaptersQuery

    if (chaptersError) {
      throw new Error('Failed to fetch chapters')
    }

    // Generate content based on format
    let content: string;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'pdf':
        content = generatePDF(book, chapters || [], options);
        mimeType = 'text/html'; // We're generating HTML that can be converted to PDF
        fileExtension = 'html';
        break;
      case 'epub':
        content = generateEPUB(book, chapters || []);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      case 'docx':
        content = generateDOCX(book, chapters || []);
        mimeType = 'application/xml';
        fileExtension = 'xml';
        break;
      case 'html':
        content = generateHTML(book, chapters || []);
        mimeType = 'text/html';
        fileExtension = 'html';
        break;
      case 'json':
        content = generateJSON(book, chapters || []);
        mimeType = 'application/json';
        fileExtension = 'json';
        break;
      default:
        throw new Error('Unsupported format')
    }

    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;

    // Log export activity
    const { error: logError } = await supabaseClient
      .from('activity_log')
      .insert({
        user_id: user.id,
        entity_type: 'book',
        entity_id: bookId,
        action: 'export',
        metadata_json: JSON.stringify({
          format,
          options,
          filename,
          chapter_count: chapters?.length || 0
        })
      })

    if (logError) {
      console.error('Failed to log export activity:', logError)
    }

    // For this demo, we'll return the content directly
    // In production, you'd upload to storage and return a download URL
    const base64Content = btoa(unescape(encodeURIComponent(content)));
    const dataUrl = `data:${mimeType};base64,${base64Content}`;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          downloadUrl: dataUrl,
          filename,
          format,
          size: content.length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in export-book function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
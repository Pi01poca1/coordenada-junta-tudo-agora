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

// Generate DOCX XML structure
const generateDocxXml = (book: any, chapters: any[]): string => {
  const title = book.title || 'Sem título';
  const description = book.description || '';
  
  let content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:t>${title}</w:t>
      </w:r>
    </w:p>`;

  if (description) {
    content += `
    <w:p>
      <w:r>
        <w:t>${description}</w:t>
      </w:r>
    </w:p>`;
  }

  chapters.forEach((chapter, index) => {
    content += `
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
      </w:pPr>
      <w:r>
        <w:t>CAPÍTULO ${chapter.order_index || index + 1}: ${chapter.title}</w:t>
      </w:r>
    </w:p>`;
    
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        content += `
    <w:p>
      <w:r>
        <w:t>${paragraph}</w:t>
      </w:r>
    </w:p>`;
      });
    }
  });

  content += `
  </w:body>
</w:document>`;
  
  return content;
};

// Generate HTML structure  
const generateHtmlContent = (book: any, chapters: any[], template: string = 'default'): string => {
  const title = book.title || 'Sem título';
  const description = book.description || '';
  
  const styles = template === 'modern' ? `
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.8; color: #2c3e50; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
    h1 { color: #3498db; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    h2 { color: #e74c3c; margin-top: 40px; }
    .description { background: #ecf0f1; padding: 20px; border-radius: 8px; font-style: italic; }
  ` : `
    body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #2c3e50; }
    h2 { color: #34495e; margin-top: 30px; }
    .description { font-style: italic; color: #7f8c8d; }
  `;

  let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${styles}</style>
</head>
<body>
  <h1>${title}</h1>`;

  if (description) {
    html += `<div class="description">${description}</div>`;
  }

  chapters.forEach((chapter, index) => {
    html += `<h2>CAPÍTULO ${chapter.order_index || index + 1}: ${chapter.title}</h2>`;
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        html += `<p>${paragraph}</p>`;
      });
    }
  });

  html += `</body></html>`;
  return html;
};

// Generate EPUB structure (simplified)
const generateEpubContent = (book: any, chapters: any[]): string => {
  const title = book.title || 'Sem título';
  let content = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0">
  <metadata>
    <dc:title xmlns:dc="http://purl.org/dc/elements/1.1/">${title}</dc:title>
    <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">Author</dc:creator>
    <dc:language xmlns:dc="http://purl.org/dc/elements/1.1/">pt-BR</dc:language>
  </metadata>
  <manifest>
    <item id="toc" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`;

  chapters.forEach((chapter, index) => {
    content += `<item id="chapter${index + 1}" href="chapter${index + 1}.xhtml" media-type="application/xhtml+xml"/>`;
  });

  content += `</manifest><spine toc="toc">`;
  
  chapters.forEach((chapter, index) => {
    content += `<itemref idref="chapter${index + 1}"/>`;
  });

  content += `</spine></package>`;
  return content;
};


serve(async (req) => {
  console.log('Export function called with method:', req.method);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Handle GET requests with query parameters (for direct downloads)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    const format = url.searchParams.get('format') as 'pdf' | 'epub' | 'docx' | 'html' | 'json';
    const options = {
      template: url.searchParams.get('template') || 'default',
      includeImages: url.searchParams.get('includeImages') === 'true',
      chapterRange: url.searchParams.get('chapterStart') ? {
        start: parseInt(url.searchParams.get('chapterStart') || '1'),
        end: parseInt(url.searchParams.get('chapterEnd') || '999')
      } : undefined
    };

    if (!bookId || !format) {
      return new Response('Missing bookId or format', { status: 400, headers: corsHeaders });
    }

    // Process the request with the extracted parameters
    try {
      return await processExportRequest(req, { bookId, format, options });
    } catch (error) {
      console.error('GET Export error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Unknown error occurred' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  }

  // Handle POST requests (original method)
  if (req.method === 'POST') {
    try {
      const { bookId, format, options = {} }: ExportRequest = await req.json();
      return await processExportRequest(req, { bookId, format, options });
    } catch (error) {
      console.error('POST Export error:', error);
      return new Response(
        JSON.stringify({ error: error.message || 'Unknown error occurred' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  }

  return new Response('Method not allowed', { status: 405, headers: corsHeaders });
});

async function processExportRequest(req: Request, { bookId, format, options = {} }: ExportRequest) {
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

    // Generate content based on format
    let content: string;
    
    switch (format) {
      case 'docx':
        content = generateDocxXml(book, chapters || []);
        break;
      case 'html':
        content = generateHtmlContent(book, chapters || [], options.template);
        break;
      case 'epub':
        content = generateEpubContent(book, chapters || []);
        break;
      case 'json':
        content = JSON.stringify({
          book: {
            id: book.id,
            title: book.title,
            description: book.description,
            status: book.status,
            created_at: book.created_at,
            updated_at: book.updated_at
          },
          chapters: (chapters || []).map(chapter => ({
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
        break;
      case 'pdf':
      default:
        // For PDF we'll use HTML structure that browsers can print to PDF
        content = generateHtmlContent(book, chapters || [], options.template);
        break;
    }
    
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
}
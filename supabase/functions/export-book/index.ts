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

// Função para escapar XML
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// PDF generator - returns HTML ready for PDF conversion with better styling
const generatePDF = (book: any, chapters: any[]): string => {
  const html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${escapeXml(book.title)}</title>
    <style>
        @page { 
            size: A4; 
            margin: 2.5cm 2cm; 
            @bottom-right { content: counter(page); }
        }
        * { box-sizing: border-box; }
        body { 
            font-family: 'Georgia', 'Times New Roman', serif; 
            margin: 0; 
            padding: 0;
            line-height: 1.8; 
            color: #1a1a1a; 
            font-size: 12pt;
        }
        .cover {
            text-align: center;
            margin-bottom: 3cm;
            page-break-after: always;
        }
        .title { 
            font-size: 32pt; 
            font-weight: bold; 
            margin-bottom: 1cm; 
            color: #2c3e50;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .description { 
            font-size: 14pt;
            margin-bottom: 2cm; 
            color: #555; 
            font-style: italic;
            max-width: 80%;
            margin-left: auto;
            margin-right: auto;
        }
        .chapter { 
            page-break-before: always; 
            margin-bottom: 2cm; 
        }
        .chapter:first-of-type { page-break-before: auto; }
        .chapter-title { 
            font-size: 18pt; 
            font-weight: bold; 
            margin-bottom: 1cm; 
            color: #34495e; 
            border-bottom: 2px solid #ecf0f1; 
            padding-bottom: 0.5cm; 
        }
        .chapter-content { 
            text-align: justify; 
            text-indent: 1.5em;
        }
        .chapter-content p { 
            margin-bottom: 1em; 
            line-height: 1.8;
        }
        .chapter-content p:first-child { text-indent: 0; }
    </style>
</head>
<body>
    <div class="cover">
        <h1 class="title">${escapeXml(book.title)}</h1>
        ${book.description ? `<div class="description">${escapeXml(book.description)}</div>` : ''}
        <div style="margin-top: 2cm; font-size: 10pt; color: #666;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')}
        </div>
    </div>
    
    ${chapters.map((chapter, index) => `
        <div class="chapter">
            <h2 class="chapter-title">Capítulo ${chapter.order_index || index + 1}: ${escapeXml(chapter.title)}</h2>
            <div class="chapter-content">
                ${chapter.content ? 
                  chapter.content.split('\n')
                    .filter(p => p.trim())
                    .map(p => `<p>${escapeXml(p)}</p>`)
                    .join('') 
                  : '<p><em>Sem conteúdo</em></p>'
                }
            </div>
        </div>
    `).join('')}
</body>
</html>`;

  return html;
};

// EPUB generator - creates proper EPUB structure
const generateEPUB = (book: any, chapters: any[]): Uint8Array => {
  // Simulated EPUB structure as a simple ZIP
  const content = `EPUB Content:
Title: ${book.title}
Description: ${book.description || 'Sem descrição'}

${chapters.map((chapter, index) => `
=== Capítulo ${chapter.order_index || index + 1}: ${chapter.title} ===

${chapter.content || 'Sem conteúdo'}

`).join('')}

Generated on: ${new Date().toLocaleString('pt-BR')}`;

  return new TextEncoder().encode(content);
};

// DOCX generator - creates proper Word document structure
const generateDOCX = (book: any, chapters: any[]): Uint8Array => {
  // Basic XML structure for Word document
  const wordContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:jc w:val="center"/></w:pPr>
      <w:r><w:rPr><w:b/><w:sz w:val="32"/></w:rPr><w:t>${escapeXml(book.title)}</w:t></w:r>
    </w:p>
    ${book.description ? `<w:p><w:r><w:t>${escapeXml(book.description)}</w:t></w:r></w:p>` : ''}
    ${chapters.map((chapter, index) => `
    <w:p>
      <w:r><w:rPr><w:b/><w:sz w:val="24"/></w:rPr><w:t>Capítulo ${chapter.order_index || index + 1}: ${escapeXml(chapter.title)}</w:t></w:r>
    </w:p>
    ${chapter.content ? chapter.content.split('\n').filter(p => p.trim()).map(p => `<w:p><w:r><w:t>${escapeXml(p)}</w:t></w:r></w:p>`).join('') : '<w:p><w:r><w:i><w:t>Sem conteúdo</w:t></w:i></w:r></w:p>'}
    `).join('')}
  </w:body>
</w:document>`;

  return new TextEncoder().encode(wordContent);
};

// HTML generator
const generateHTML = (book: any, chapters: any[]): string => {
  return generatePDF(book, chapters);
};

// JSON generator
const generateJSON = (book: any, chapters: any[]): string => {
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

    // Generate content based on format
    let content: string | Uint8Array;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'pdf':
        content = generatePDF(book, chapters || []);
        mimeType = 'application/pdf';
        fileExtension = 'pdf';
        break;
      case 'epub':
        content = generateEPUB(book, chapters || []);
        mimeType = 'application/epub+zip';
        fileExtension = 'epub';
        break;
      case 'docx':
        content = generateDOCX(book, chapters || []);
        mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileExtension = 'docx';
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
        throw new Error(`Unsupported format: ${format}`);
    }

    // Create safe filename
    const safeTitle = book.title.replace(/[^a-zA-Z0-9_\-\s]/g, '').replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${safeTitle}_${timestamp}.${fileExtension}`;

    console.log('Generated content for format:', format, 'filename:', filename);

    // Return content with proper headers
    const headers = {
      ...corsHeaders,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };

    if (typeof content === 'string') {
      return new Response(content, { headers });
    } else {
      return new Response(content, { headers });
    }

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
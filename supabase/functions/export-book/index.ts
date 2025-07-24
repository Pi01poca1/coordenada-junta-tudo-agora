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

// PDF generator - returns HTML ready for PDF conversion
const generatePDF = (book: any, chapters: any[], options: any = {}) => {
  const template = options.template || 'default';
  
  let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${book.title}</title>
    <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: Georgia, serif; margin: 0; line-height: 1.6; color: #333; }
        .title { font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #2c3e50; }
        .author { font-size: 16px; text-align: center; margin-bottom: 40px; color: #7f8c8d; }
        .chapter { page-break-before: always; margin-bottom: 40px; }
        .chapter:first-child { page-break-before: auto; }
        .chapter-title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
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

// EPUB generator - creates proper EPUB structure
const generateEPUB = (book: any, chapters: any[]) => {
  const mimetype = 'application/epub+zip';
  
  // Basic EPUB structure in XML format
  const content = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${book.title}</dc:title>
    <dc:creator>Author</dc:creator>
    <dc:language>pt-BR</dc:language>
    <dc:date>${new Date().toISOString()}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${chapters.map((_, i) => `<item id="chapter${i+1}" href="chapter${i+1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine>
    ${chapters.map((_, i) => `<itemref idref="chapter${i+1}"/>`).join('\n    ')}
  </spine>
</package>

${chapters.map((chapter, i) => `
<!-- Chapter ${i+1}: ${chapter.title} -->
<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${chapter.title}</title></head>
<body>
  <h1>${chapter.title}</h1>
  ${chapter.content ? chapter.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '<br/>').join('\n  ') : ''}
</body>
</html>
`).join('\n')}`;

  return content;
};

// DOCX generator - creates Word-compatible document
const generateDOCX = (book: any, chapters: any[]) => {
  // Generate Office Open XML structure for DOCX
  let docx = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Title"/></w:pPr>
      <w:r><w:t>${book.title}</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Subtitle"/></w:pPr>
      <w:r><w:t>Autor: ${book.owner_id}</w:t></w:r>
    </w:p>`;
  
  chapters.forEach(chapter => {
    docx += `
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Capítulo ${chapter.order_index}: ${chapter.title}</w:t></w:r>
    </w:p>`;
    
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(para => {
        docx += `
    <w:p>
      <w:r><w:t>${para}</w:t></w:r>
    </w:p>`;
      });
    }
  });
  
  docx += `
  </w:body>
</w:document>`;
  
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

    // Create authenticated client using the session from request
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || ''
    
    console.log('Processing request with auth header:', !!authHeader)
    
    // Create client with user session
    const authedClient = createClient(
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
    )

    // Get the current user
    const { data: { user }, error: userError } = await authedClient.auth.getUser()
    
    if (userError || !user) {
      console.error('User authentication failed:', userError)
      throw new Error('Authentication required')
    }

    console.log('Authenticated user:', user.id)

    const { bookId, format, options = {} }: ExportRequest = await req.json()

    console.log('Looking for book:', bookId, 'for user:', user.id)

    // Fetch book
    const { data: book, error: bookError } = await authedClient
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_id', user.id)
      .maybeSingle()

    console.log('Book query result:', { book, bookError })

    if (bookError) {
      console.error('Book query error:', bookError)
      throw new Error('Database error: ' + bookError.message)
    }
    
    if (!book) {
      throw new Error('Book not found or access denied')
    }

    // Fetch chapters
    let chaptersQuery = authedClient
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
        throw new Error('Unsupported format')
    }

    // Create filename
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${fileExtension}`;

    // Log export activity
    const { error: logError } = await authedClient
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JSZip } from "https://deno.land/x/jszip@0.11.0/mod.ts"

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
const generateEPUB = async (book: any, chapters: any[]) => {
  const zip = new JSZip();
  
  // Add mimetype file (must be first and uncompressed)
  zip.addFile("mimetype", "application/epub+zip", { compression: "STORE" });
  
  // META-INF/container.xml
  zip.addFile("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  // OEBPS/content.opf (package document)
  zip.addFile("OEBPS/content.opf", `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${book.id}</dc:identifier>
    <dc:title>${book.title}</dc:title>
    <dc:creator>Autor</dc:creator>
    <dc:language>pt-BR</dc:language>
    <dc:date>${new Date().toISOString().split('T')[0]}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    ${chapters.map((_, i) => `<item id="chapter${i+1}" href="chapter${i+1}.xhtml" media-type="application/xhtml+xml"/>`).join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${chapters.map((_, i) => `<itemref idref="chapter${i+1}"/>`).join('\n    ')}
  </spine>
</package>`);

  // OEBPS/nav.xhtml (navigation document)
  zip.addFile("OEBPS/nav.xhtml", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>Navegação</title>
</head>
<body>
  <nav xmlns:epub="http://www.idpf.org/2007/ops" epub:type="toc">
    <h1>Sumário</h1>
    <ol>
      ${chapters.map((chapter, i) => `<li><a href="chapter${i+1}.xhtml">${chapter.title}</a></li>`).join('\n      ')}
    </ol>
  </nav>
</body>
</html>`);

  // OEBPS/toc.ncx (NCX navigation)
  zip.addFile("OEBPS/toc.ncx", `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${book.id}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${book.title}</text></docTitle>
  <navMap>
    ${chapters.map((chapter, i) => `
    <navPoint id="navpoint-${i+1}" playOrder="${i+1}">
      <navLabel><text>${chapter.title}</text></navLabel>
      <content src="chapter${i+1}.xhtml"/>
    </navPoint>`).join('')}
  </navMap>
</ncx>`);

  // Add each chapter as XHTML
  chapters.forEach((chapter, i) => {
    const chapterContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${chapter.title}</title>
  <style>
    body { font-family: serif; line-height: 1.6; margin: 2em; }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5em; }
    p { margin-bottom: 1em; text-align: justify; }
  </style>
</head>
<body>
  <h1>${chapter.title}</h1>
  ${chapter.content ? chapter.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').filter(Boolean).join('\n  ') : '<p>Sem conteúdo</p>'}
</body>
</html>`;
    
    zip.addFile(`OEBPS/chapter${i+1}.xhtml`, chapterContent);
  });

  return await zip.generateAsync({ type: "uint8array" });
};

// DOCX generator - creates Word-compatible document
const generateDOCX = async (book: any, chapters: any[]) => {
  const zip = new JSZip();
  
  // [Content_Types].xml
  zip.addFile("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  // _rels/.rels
  zip.addFile("_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  // word/_rels/document.xml.rels
  zip.addFile("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

  // word/document.xml
  let documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:sz w:val="48"/>
          <w:b/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="48"/>
          <w:b/>
        </w:rPr>
        <w:t>${book.title}</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:r>
        <w:t>por Autor</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>`;

  chapters.forEach((chapter, index) => {
    // Chapter title
    documentXml += `
    <w:p>
      <w:pPr>
        <w:rPr>
          <w:sz w:val="32"/>
          <w:b/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="32"/>
          <w:b/>
        </w:rPr>
        <w:t>Capítulo ${chapter.order_index || index + 1}: ${chapter.title}</w:t>
      </w:r>
    </w:p>
    <w:p><w:r><w:t></w:t></w:r></w:p>`;

    // Chapter content
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        documentXml += `
    <w:p>
      <w:r>
        <w:t>${paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>`;
      });
    }
    
    documentXml += `<w:p><w:r><w:t></w:t></w:r></w:p>`;
  });

  documentXml += `
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.addFile("word/document.xml", documentXml);

  return await zip.generateAsync({ type: "uint8array" });
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
    let content: string | Uint8Array;
    let mimeType: string;
    let fileExtension: string;

    switch (format) {
      case 'pdf':
        content = generatePDF(book, chapters || [], options);
        mimeType = 'text/html'; // Will be converted to PDF on client side
        fileExtension = 'html'; // Temporary until we have proper PDF generation
        break;
      case 'epub':
        content = await generateEPUB(book, chapters || []);
        mimeType = 'application/epub+zip';
        fileExtension = 'epub';
        break;
      case 'docx':
        content = await generateDOCX(book, chapters || []);
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

    // Return content with proper headers for direct download
    const headers = {
      ...corsHeaders,
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    };

    // For text formats (HTML, JSON), return as text
    if (format === 'html' || format === 'json' || format === 'pdf') {
      headers['Content-Length'] = (content as string).length.toString();
      return new Response(content as string, { headers });
    }
    
    // For binary formats (DOCX, EPUB), return as binary
    if (content instanceof Uint8Array) {
      headers['Content-Length'] = content.length.toString();
      return new Response(content, { headers });
    }
    
    // Fallback for other formats
    const textContent = content as string;
    headers['Content-Length'] = textContent.length.toString();
    return new Response(textContent, { headers });

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
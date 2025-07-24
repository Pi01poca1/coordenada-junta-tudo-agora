import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Importações para geração de arquivos
import jsPDF from 'https://esm.sh/jspdf@2.5.1'
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'https://esm.sh/docx@8.2.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🚀 Export function called with method:', req.method);
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookId, format, options } = await req.json()
    console.log('📥 Export request:', { bookId, format, options });
    
    // Verificar token
    const authHeader = req.headers.get('authorization');
    console.log('🔐 Processing request with token present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.split(' ')[1];
    
    // Inicializar Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    )

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }
    console.log('✅ Authenticated user:', user.id);

    // Buscar dados do livro
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('*')
      .eq('id', bookId)
      .eq('owner_id', user.id)
      .single()

    if (bookError || !book) {
      throw new Error('Livro não encontrado ou acesso negado')
    }
    console.log('📚 Found book:', book.title);

    // Buscar capítulos
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('order_index', { ascending: true })

    if (chaptersError) {
      throw new Error('Erro ao buscar capítulos')
    }
    console.log('📄 Found chapters:', chapters?.length || 0);

    let fileBuffer: Uint8Array
    let mimeType: string
    let filename: string

    switch (format) {
      case 'pdf':
        ({ fileBuffer, mimeType, filename } = await generatePDF(book, chapters || []))
        break
      
      case 'docx':
        ({ fileBuffer, mimeType, filename } = await generateDOCX(book, chapters || []))
        break
      
      case 'epub':
        ({ fileBuffer, mimeType, filename } = await generateEPUB(book, chapters || []))
        break
      
      case 'html':
        ({ fileBuffer, mimeType, filename } = generateHTML(book, chapters || []))
        break
      
      case 'json':
        ({ fileBuffer, mimeType, filename } = generateJSON(book, chapters || []))
        break
      
      case 'txt':
      default:
        ({ fileBuffer, mimeType, filename } = generateTXT(book, chapters || []))
        break
    }

    // Converter para base64
    const base64 = btoa(String.fromCharCode(...fileBuffer))
    console.log('✅ Generated file:', { size: fileBuffer.length, filename, mimeType });

    return new Response(
      JSON.stringify({
        success: true,
        data: base64,
        mimeType,
        filename
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro na export-book:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// ===============================
// GERADORES ESPECÍFICOS
// ===============================

async function generatePDF(book: any, chapters: any[]): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📄 Generating PDF...');
  
  const doc = new jsPDF()
  let yPosition = 20

  // Título do livro
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text(book.title, 20, yPosition)
  yPosition += 15

  // Descrição
  if (book.description) {
    doc.setFontSize(12)
    doc.setFont(undefined, 'normal')
    const descLines = doc.splitTextToSize(book.description, 170)
    doc.text(descLines, 20, yPosition)
    yPosition += (descLines.length * 7) + 10
  }

  // Capítulos
  for (const chapter of chapters) {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    // Título do capítulo
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text(`Capítulo ${chapter.order_index || 'S/N'}: ${chapter.title}`, 20, yPosition)
    yPosition += 15

    // Conteúdo do capítulo
    if (chapter.content) {
      doc.setFontSize(12)
      doc.setFont(undefined, 'normal')
      const contentLines = doc.splitTextToSize(chapter.content, 170)
      
      for (let i = 0; i < contentLines.length; i++) {
        if (yPosition > 280) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(contentLines[i], 20, yPosition)
        yPosition += 7
      }
    }
    yPosition += 15
  }

  const pdfBuffer = doc.output('arraybuffer')
  return {
    fileBuffer: new Uint8Array(pdfBuffer),
    mimeType: 'application/pdf',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  }
}

async function generateDOCX(book: any, chapters: any[]): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📘 Generating DOCX...');
  
  const children = []

  // Título do livro
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: book.title,
          bold: true,
          size: 32,
        }),
      ],
      heading: HeadingLevel.TITLE,
    })
  )

  // Descrição
  if (book.description) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: book.description,
            size: 20,
          }),
        ],
      })
    )
  }

  // Linha em branco
  children.push(new Paragraph({ children: [new TextRun({ text: "" })] }))

  // Capítulos
  for (const chapter of chapters) {
    // Título do capítulo
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Capítulo ${chapter.order_index || 'S/N'}: ${chapter.title}`,
            bold: true,
            size: 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
      })
    )

    // Conteúdo do capítulo
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n')
      for (const para of paragraphs) {
        if (para.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para,
                  size: 20,
                }),
              ],
            })
          )
        }
      }
    }

    // Linha em branco entre capítulos
    children.push(new Paragraph({ children: [new TextRun({ text: "" })] }))
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  })

  const buffer = await Packer.toBuffer(doc)
  return {
    fileBuffer: new Uint8Array(buffer),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx`
  }
}

async function generateEPUB(book: any, chapters: any[]): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📚 Generating EPUB...');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${book.title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: serif; line-height: 1.6; margin: 40px; }
          h1 { text-align: center; margin-bottom: 40px; }
          h2 { margin-top: 40px; page-break-before: always; }
          p { text-indent: 1.5em; margin-bottom: 1em; }
        </style>
    </head>
    <body>
        <h1>${book.title}</h1>
        ${book.description ? `<p><em>${book.description}</em></p>` : ''}
        
        ${chapters.map(chapter => `
            <h2>Capítulo ${chapter.order_index || 'S/N'}: ${chapter.title}</h2>
            <div>${chapter.content ? chapter.content.split('\n').map(p => `<p>${p}</p>`).join('') : '<p>Sem conteúdo</p>'}</div>
        `).join('')}
    </body>
    </html>
  `

  const encoder = new TextEncoder()
  const buffer = encoder.encode(content)
  
  return {
    fileBuffer: buffer,
    mimeType: 'application/epub+zip',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.epub`
  }
}

function generateHTML(book: any, chapters: any[]): {fileBuffer: Uint8Array, mimeType: string, filename: string} {
  console.log('🌐 Generating HTML...');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${book.title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #333; text-align: center; }
          h2 { color: #666; margin-top: 30px; border-left: 4px solid #666; padding-left: 10px; }
          .chapter { margin-bottom: 30px; }
          .content { line-height: 1.6; text-align: justify; }
          .description { font-style: italic; background: #f5f5f5; padding: 15px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <h1>${book.title}</h1>
        ${book.description ? `<div class="description">${book.description}</div>` : ''}
        
        ${chapters.map(chapter => `
          <div class="chapter">
            <h2>Capítulo ${chapter.order_index || 'S/N'}: ${chapter.title}</h2>
            <div class="content">${chapter.content ? chapter.content.replace(/\n/g, '<br><br>') : 'Sem conteúdo'}</div>
          </div>
        `).join('')}
    </body>
    </html>
  `

  const encoder = new TextEncoder()
  const buffer = encoder.encode(content)
  
  return {
    fileBuffer: buffer,
    mimeType: 'text/html',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.html`
  }
}

function generateJSON(book: any, chapters: any[]): {fileBuffer: Uint8Array, mimeType: string, filename: string} {
  console.log('📋 Generating JSON...');
  
  const data = {
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
    export_metadata: {
      exported_at: new Date().toISOString(),
      total_chapters: chapters.length,
      format: 'json'
    }
  }

  const encoder = new TextEncoder()
  const buffer = encoder.encode(JSON.stringify(data, null, 2))
  
  return {
    fileBuffer: buffer,
    mimeType: 'application/json',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
  }
}

function generateTXT(book: any, chapters: any[]): {fileBuffer: Uint8Array, mimeType: string, filename: string} {
  console.log('📝 Generating TXT...');
  
  let content = `${book.title}\n`
  content += `${'='.repeat(book.title.length)}\n\n`
  
  if (book.description) {
    content += `${book.description}\n\n`
  }
  
  content += `${'='.repeat(50)}\n\n`
  
  for (const chapter of chapters) {
    content += `CAPÍTULO ${chapter.order_index || 'S/N'}: ${chapter.title}\n`
    content += `${'-'.repeat(30)}\n\n`
    if (chapter.content) {
      content += `${chapter.content}\n\n`
    }
    content += `\n${'='.repeat(50)}\n\n`
  }

  const encoder = new TextEncoder()
  const buffer = encoder.encode(content)
  
  return {
    fileBuffer: buffer,
    mimeType: 'text/plain',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`
  }
}
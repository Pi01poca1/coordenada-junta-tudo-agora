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

    // Buscar imagem de capa
    const { data: coverImage, error: coverError } = await supabase
      .from('book_covers')
      .select(`
        *,
        images (
          url,
          filename,
          storage_path,
          mime_type
        )
      `)
      .eq('book_id', bookId)
      .single()

    if (coverError && coverError.code !== 'PGRST116') {
      console.warn('Aviso ao buscar capa:', coverError)
    }
    console.log('🖼️ Cover image found:', !!coverImage);

    // Buscar todas as imagens do livro para inclusão nos capítulos
    const { data: bookImages, error: imagesError } = await supabase
      .from('images')
      .select('*')
      .eq('book_id', bookId)

    if (imagesError) {
      console.warn('Aviso ao buscar imagens:', imagesError)
    }
    console.log('🖼️ Book images found:', bookImages?.length || 0);

    let fileBuffer: Uint8Array
    let mimeType: string
    let filename: string

    switch (format) {
      case 'pdf':
        ({ fileBuffer, mimeType, filename } = await generatePDF(book, chapters || [], coverImage, bookImages || [], options))
        break
      
      case 'docx':
        ({ fileBuffer, mimeType, filename } = await generateDOCX(book, chapters || [], coverImage, bookImages || [], options))
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
    console.log('📦 Convertendo para base64, tamanho do buffer:', fileBuffer.length);
    const base64 = btoa(String.fromCharCode(...fileBuffer))
    console.log('✅ Generated file:', { 
      size: fileBuffer.length, 
      filename, 
      mimeType,
      base64Length: base64.length 
    });

    const response = {
      success: true,
      data: base64,
      mimeType,
      filename
    };

    console.log('📤 Enviando resposta com dados:', {
      success: response.success,
      mimeType: response.mimeType,
      filename: response.filename,
      dataLength: response.data.length
    });

    return new Response(
      JSON.stringify(response),
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

async function generatePDF(book: any, chapters: any[], coverImage: any, bookImages: any[], options: any): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📄 Generating professional PDF...');
  
  const isABNT = options?.template === 'abnt';
  const doc = new jsPDF();
  
  // PÁGINA 1: CAPA
  await addCoverPage(doc, book, coverImage, isABNT);
  
  // PÁGINA 2: CONTRA-CAPA/PREFÁCIO
  doc.addPage();
  addPreface(doc, book, isABNT);
  
  // PÁGINA 3: SUMÁRIO
  doc.addPage();
  const tocPageNumbers = addTableOfContents(doc, chapters, isABNT);
  
  // CAPÍTULOS
  let currentPage = doc.internal.getNumberOfPages();
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    doc.addPage();
    currentPage++;
    
    // Atualizar número da página no sumário
    tocPageNumbers[i] = currentPage;
    
    addChapterContent(doc, chapter, bookImages, isABNT);
  }
  
  // Voltar e atualizar o sumário com os números de página corretos
  updateTableOfContents(doc, chapters, tocPageNumbers, isABNT);

  const pdfBuffer = doc.output('arraybuffer');
  return {
    fileBuffer: new Uint8Array(pdfBuffer),
    mimeType: 'application/pdf',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${isABNT ? 'ABNT' : 'profissional'}.pdf`
  };
}

async function addCoverPage(doc: any, book: any, coverImage: any, isABNT: boolean) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Corrigir acesso à URL da imagem - coverImage vem com join da tabela images
  const imageUrl = coverImage?.images?.url;
  
  if (imageUrl) {
    try {
      console.log('🖼️ Carregando imagem de capa:', imageUrl);
      // Tentar carregar e adicionar a imagem de capa
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const imageBlob = await response.blob();
      const base64 = await blobToBase64(imageBlob);
      
      // Adicionar imagem ocupando toda a página
      doc.addImage(base64, 'JPEG', 0, 0, pageWidth, pageHeight);
      console.log('✅ Imagem de capa adicionada com sucesso');
    } catch (error) {
      console.warn('Erro ao carregar imagem de capa, usando layout texto:', error);
      addTextCover(doc, book, isABNT);
    }
  } else {
    console.log('📝 Usando capa de texto (sem imagem)');
    addTextCover(doc, book, isABNT);
  }
}

function addTextCover(doc: any, book: any, isABNT: boolean) {
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;
  
  if (isABNT) {
    // Layout ABNT
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('UNIVERSIDADE FEDERAL DO BRASIL', centerX, 30, { align: 'center' });
    doc.text('CURSO DE LETRAS', centerX, 40, { align: 'center' });
    
    doc.setFontSize(24);
    doc.text(book.title.toUpperCase(), centerX, 150, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Autor: [Nome do Autor]', centerX, 200, { align: 'center' });
    
    doc.text('Cidade', centerX, 250, { align: 'center' });
    doc.text(new Date().getFullYear().toString(), centerX, 260, { align: 'center' });
  } else {
    // Layout profissional
    doc.setFontSize(32);
    doc.setFont(undefined, 'bold');
    doc.text(book.title, centerX, 120, { align: 'center' });
    
    if (book.description) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'italic');
      const descLines = doc.splitTextToSize(book.description, 150);
      doc.text(descLines, centerX, 150, { align: 'center' });
    }
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'normal');
    doc.text('Autor: [Nome do Autor]', centerX, 220, { align: 'center' });
    doc.text(new Date().getFullYear().toString(), centerX, 250, { align: 'center' });
  }
}

function addPreface(doc: any, book: any, isABNT: boolean) {
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 20;
  
  // Título
  doc.setFontSize(isABNT ? 14 : 18);
  doc.setFont(undefined, 'bold');
  doc.text(isABNT ? 'PREFÁCIO' : 'Prefácio', margin, yPosition);
  yPosition += 20;
  
  // Conteúdo do prefácio
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const prefaceText = book.description || 
    `Esta obra representa um trabalho dedicado ao tema proposto, desenvolvido com rigor acadêmico e compromisso com a qualidade do conteúdo apresentado.
    
    O livro "${book.title}" foi estruturado de forma a proporcionar uma leitura fluida e compreensiva, abordando os principais aspectos do assunto de maneira clara e objetiva.
    
    Esperamos que este material possa contribuir significativamente para o conhecimento e desenvolvimento dos leitores.`;
  
  const prefaceLines = doc.splitTextToSize(prefaceText, 170 - (isABNT ? 20 : 0));
  doc.text(prefaceLines, margin, yPosition);
  
  if (isABNT) {
    yPosition = 250;
    doc.text('O Autor', margin, yPosition);
    doc.text(new Date().getFullYear().toString(), margin, yPosition + 10);
  }
}

function addTableOfContents(doc: any, chapters: any[], isABNT: boolean): number[] {
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 20;
  const tocPageNumbers: number[] = [];
  
  // Título
  doc.setFontSize(isABNT ? 14 : 18);
  doc.setFont(undefined, 'bold');
  doc.text(isABNT ? 'SUMÁRIO' : 'Sumário', margin, yPosition);
  yPosition += 20;
  
  // Entradas do sumário
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterTitle = `${chapter.order_index || (i + 1)}. ${chapter.title}`;
    const placeholder = '...'; // Será atualizado depois
    
    tocPageNumbers.push(0); // Placeholder para o número da página
    
    doc.text(chapterTitle, margin, yPosition);
    doc.text(placeholder, 180, yPosition);
    yPosition += 10;
    
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin + 20;
    }
  }
  
  return tocPageNumbers;
}

function updateTableOfContents(doc: any, chapters: any[], pageNumbers: number[], isABNT: boolean) {
  // Voltar para a página do sumário (página 3)
  const currentPage = doc.internal.getNumberOfPages();
  doc.setPage(3);
  
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 40; // Após o título "SUMÁRIO"
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  for (let i = 0; i < chapters.length; i++) {
    const pageNum = pageNumbers[i].toString();
    
    // Limpar a área do número da página e adicionar o correto
    doc.setFillColor(255, 255, 255);
    doc.rect(175, yPosition - 5, 20, 8, 'F');
    doc.text(pageNum, 180, yPosition);
    yPosition += 10;
    
    if (yPosition > 250) {
      yPosition = margin + 20;
    }
  }
  
  // Voltar para a última página
  doc.setPage(currentPage);
}

function addChapterContent(doc: any, chapter: any, bookImages: any[], isABNT: boolean) {
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 20;
  
  // Título do capítulo
  doc.setFontSize(isABNT ? 14 : 16);
  doc.setFont(undefined, 'bold');
  const chapterTitle = `${chapter.order_index || 'S/N'}. ${chapter.title.toUpperCase()}`;
  doc.text(chapterTitle, margin, yPosition);
  yPosition += 20;
  
  // Conteúdo do capítulo
  if (chapter.content) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    // Dividir conteúdo em parágrafos
    const paragraphs = chapter.content.split('\n').filter((p: string) => p.trim());
    
    for (const paragraph of paragraphs) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = margin + 20;
      }
      
      const lines = doc.splitTextToSize(paragraph, 170 - (isABNT ? 20 : 0));
      
      for (const line of lines) {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = margin + 20;
        }
        doc.text(line, margin + (isABNT ? 15 : 0), yPosition); // Recuo ABNT
        yPosition += 6;
      }
      yPosition += 6; // Espaço entre parágrafos
    }
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateDOCX(book: any, chapters: any[], coverImage: any, bookImages: any[], options: any): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📘 Generating professional DOCX...');
  
  const isABNT = options?.template === 'abnt';
  const children = [];

  // CAPA
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isABNT ? 'UNIVERSIDADE FEDERAL DO BRASIL' : '',
          bold: true,
          size: 24,
        }),
      ],
      alignment: 'center',
      spacing: { after: 200 }
    })
  );

  if (isABNT) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'CURSO DE LETRAS',
            bold: true,
            size: 20,
          }),
        ],
        alignment: 'center',
        spacing: { after: 800 }
      })
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: book.title.toUpperCase(),
          bold: true,
          size: isABNT ? 28 : 36,
        }),
      ],
      alignment: 'center',
      spacing: { after: 800 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Autor: [Nome do Autor]',
          size: 20,
        }),
      ],
      alignment: 'center',
      spacing: { after: 400 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Cidade\n${new Date().getFullYear()}`,
          size: 18,
        }),
      ],
      alignment: 'center',
      pageBreakBefore: false
    })
  );

  // QUEBRA DE PÁGINA
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "", break: 1 })],
      pageBreakBefore: true
    })
  );

  // PREFÁCIO
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isABNT ? 'PREFÁCIO' : 'Prefácio',
          bold: true,
          size: isABNT ? 24 : 28,
        }),
      ],
      alignment: isABNT ? 'center' : 'left',
      spacing: { after: 400 }
    })
  );

  const prefaceText = book.description || 
    `Esta obra representa um trabalho dedicado ao tema proposto, desenvolvido com rigor acadêmico e compromisso com a qualidade do conteúdo apresentado.\n\nO livro "${book.title}" foi estruturado de forma a proporcionar uma leitura fluida e compreensiva, abordando os principais aspectos do assunto de maneira clara e objetiva.\n\nEsperamos que este material possa contribuir significativamente para o conhecimento e desenvolvimento dos leitores.`;

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: prefaceText,
          size: 20,
        }),
      ],
      alignment: 'justify',
      spacing: { after: 400 }
    })
  );

  // QUEBRA DE PÁGINA PARA SUMÁRIO
  children.push(
    new Paragraph({
      children: [new TextRun({ text: "", break: 1 })],
      pageBreakBefore: true
    })
  );

  // SUMÁRIO
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isABNT ? 'SUMÁRIO' : 'Sumário',
          bold: true,
          size: isABNT ? 24 : 28,
        }),
      ],
      alignment: isABNT ? 'center' : 'left',
      spacing: { after: 400 }
    })
  );

  // Entradas do sumário
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${chapter.order_index || (i + 1)}. ${chapter.title}`,
            size: 20,
          }),
          new TextRun({
            text: `.............................. ${i + 4}`, // Página estimada
            size: 20,
          }),
        ],
        spacing: { after: 100 }
      })
    );
  }

  // CAPÍTULOS
  for (const chapter of chapters) {
    // Quebra de página antes de cada capítulo
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "", break: 1 })],
        pageBreakBefore: true
      })
    );

    // Título do capítulo
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${chapter.order_index || 'S/N'}. ${chapter.title.toUpperCase()}`,
            bold: true,
            size: isABNT ? 24 : 28,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: isABNT ? 'left' : 'left',
        spacing: { after: 400 }
      })
    );

    // Conteúdo do capítulo
    if (chapter.content) {
      const paragraphs = chapter.content.split('\n').filter((p: string) => p.trim());
      for (const para of paragraphs) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: para,
                size: 20,
              }),
            ],
            alignment: 'justify',
            spacing: { after: 200 },
            indent: isABNT ? { firstLine: 720 } : undefined // Recuo ABNT
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: isABNT ? 1134 : 1440, // 2cm ou 2.5cm
              right: isABNT ? 567 : 1440, // 1cm ou 2.5cm  
              bottom: isABNT ? 567 : 1440, // 1cm ou 2.5cm
              left: isABNT ? 1134 : 1440, // 2cm ou 2.5cm
            },
          },
        },
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return {
    fileBuffer: new Uint8Array(buffer),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${isABNT ? 'ABNT' : 'profissional'}.docx`
  };
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
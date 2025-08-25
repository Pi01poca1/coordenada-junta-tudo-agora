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
        image:images!inner (
          id,
          url,
          filename,
          storage_path,
          mime_type,
          file_size,
          alt_text
        )
      `)
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (coverError && coverError.code !== 'PGRST116') {
      console.warn('Aviso ao buscar capa:', coverError)
    }
    console.log('🖼️ Cover image found:', !!coverImage, coverImage?.length || 0);
    
    // Pegar a primeira capa se existir
    const coverImageData = coverImage && coverImage.length > 0 ? coverImage[0] : null;

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
        ({ fileBuffer, mimeType, filename } = await generatePDF(book, chapters || [], coverImageData, bookImages || [], options))
        break
      
      case 'docx':
        ({ fileBuffer, mimeType, filename } = await generateDOCX(book, chapters || [], coverImageData, bookImages || [], options))
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
  
  try {
    const isABNT = options?.template === 'abnt';
    const alignmentSettings = options?.alignmentSettings || { toc: 'left', elements: 'left', chapters: 'left' };
    const doc = new jsPDF();
    
    // PÁGINA 1: CAPA
    console.log('📄 Adicionando capa...');
    await addCoverPageSafe(doc, book, coverImage, isABNT);
    
    // PÁGINA 2: CONTRA-CAPA/PREFÁCIO
    console.log('📄 Adicionando prefácio...');
    doc.addPage();
    addPreface(doc, book, isABNT, alignmentSettings.elements);
    
    // PÁGINA 3: SUMÁRIO
    console.log('📄 Adicionando sumário...');
    doc.addPage();
    const tocPageNumbers = addTableOfContents(doc, chapters, isABNT, alignmentSettings.toc);
    
    // CAPÍTULOS
    console.log('📄 Adicionando capítulos...');
    let currentPage = doc.internal.getNumberOfPages();
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      console.log(`📖 Processando capítulo ${i + 1}: ${chapter.title}`);
      
      doc.addPage();
      currentPage++;
      
      // Atualizar número da página no sumário
      tocPageNumbers[i] = currentPage;
      
      await addChapterContentSafe(doc, chapter, bookImages, isABNT, alignmentSettings.chapters);
    }
    
    // Voltar e atualizar o sumário com os números de página corretos
    console.log('📄 Atualizando sumário...');
    updateTableOfContentsSafe(doc, chapters, tocPageNumbers, isABNT, alignmentSettings.toc);

    console.log('📄 Gerando buffer do PDF...');
    const pdfBuffer = doc.output('arraybuffer');
    
    return {
      fileBuffer: new Uint8Array(pdfBuffer),
      mimeType: 'application/pdf',
      filename: `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}_${isABNT ? 'ABNT' : 'profissional'}.pdf`
    };
  } catch (error) {
    console.error('❌ Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error.message}`);
  }
}

async function addCoverPage(doc: any, book: any, coverImage: any, isABNT: boolean) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
    // Corrigir acesso à URL da imagem - coverImage vem com join da tabela images
    const imageUrl = coverImage?.image?.url;
  
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

// Função auxiliar para calcular posição X baseada no alinhamento
function getAlignmentX(doc: any, alignment: string, margin: number): { x: number; align: string } {
  const pageWidth = doc.internal.pageSize.width;
  const centerX = pageWidth / 2;
  
  switch (alignment) {
    case 'center':
      return { x: centerX, align: 'center' };
    case 'right':
      return { x: pageWidth - margin, align: 'right' };
    default: // 'left'
      return { x: margin, align: 'left' };
  }
}

function addPreface(doc: any, book: any, isABNT: boolean, alignment: string = 'left') {
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 20;
  
  // Título com alinhamento
  doc.setFontSize(isABNT ? 14 : 18);
  doc.setFont(undefined, 'bold');
  const titleAlignment = getAlignmentX(doc, alignment, margin);
  doc.text(isABNT ? 'PREFÁCIO' : 'Prefácio', titleAlignment.x, yPosition, { align: titleAlignment.align });
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

function addTableOfContents(doc: any, chapters: any[], isABNT: boolean, alignment: string = 'left'): number[] {
  const margin = isABNT ? 30 : 20;
  let yPosition = margin + 20;
  const tocPageNumbers: number[] = [];
  
  // Título com alinhamento
  doc.setFontSize(isABNT ? 14 : 18);
  doc.setFont(undefined, 'bold');
  const titleAlignment = getAlignmentX(doc, alignment, margin);
  doc.text(isABNT ? 'SUMÁRIO' : 'Sumário', titleAlignment.x, yPosition, { align: titleAlignment.align });
  yPosition += 20;
  
  // Entradas do sumário (sempre à esquerda)
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  for (let i = 0; i < chapters.length; i++) {
    const chapter = chapters[i];
    const chapterTitle = `${chapter.order_index || (i + 1)}. ${chapter.title}`;
    const placeholder = '...'; // Será atualizado depois
    
    tocPageNumbers.push(0); // Placeholder para o número da página
    
    // Itens sempre à esquerda, independente do alinhamento do título
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

function updateTableOfContents(doc: any, chapters: any[], pageNumbers: number[], isABNT: boolean, alignment: string = 'left') {
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

// ===============================
// VERSÕES SEGURAS DAS FUNÇÕES
// ===============================

async function addCoverPageSafe(doc: any, book: any, coverImage: any, isABNT: boolean) {
  console.log('🖼️ Processando capa de forma segura...');
  console.log('🖼️ Dados da capa recebidos:', { 
    hasImage: !!coverImage?.image,
    imageUrl: coverImage?.image?.url,
    filename: coverImage?.image?.filename 
  });
  
  try {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Corrigir acesso à URL da imagem - coverImage vem com join da tabela images
    const imageUrl = coverImage?.image?.url;
    
    if (imageUrl && imageUrl.trim()) {
      console.log('🖼️ Carregando imagem de capa:', imageUrl);
      // Tentar carregar e adicionar a imagem de capa com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      try {
        const response = await fetch(imageUrl, { 
          signal: controller.signal,
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/*,*/*;q=0.8'
          }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const imageBlob = await response.blob();
        console.log('🖼️ Blob carregado:', { 
          size: imageBlob.size, 
          type: imageBlob.type 
        });
        
        if (imageBlob.size === 0) {
          throw new Error('Imagem vazia recebida');
        }
        
        const base64 = await blobToBase64Safe(imageBlob);
        console.log('🖼️ Base64 convertido:', base64.length, 'chars');
        
        if (!base64 || base64.length < 100) {
          throw new Error('Base64 inválido ou muito pequeno');
        }
        
        // Detectar formato da imagem
        const imageFormat = detectImageFormat(imageBlob.type);
        console.log('🖼️ Formato detectado:', imageFormat);
        
        // Adicionar imagem ocupando toda a página com melhor qualidade
        doc.addImage(`data:${imageBlob.type};base64,${base64}`, imageFormat, 0, 0, pageWidth, pageHeight);
        console.log('✅ Imagem de capa adicionada com sucesso');
        return;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.warn('Erro ao carregar imagem de capa:', fetchError);
      }
    }
    
    // Fallback para capa de texto
    console.log('📝 Usando capa de texto (sem imagem)');
    addTextCover(doc, book, isABNT);
    
  } catch (error) {
    console.error('❌ Erro na função addCoverPageSafe:', error);
    addTextCover(doc, book, isABNT);
  }
}

async function addChapterContentSafe(doc: any, chapter: any, bookImages: any[], isABNT: boolean, alignment: string = 'left') {
  console.log('📖 Processando capítulo de forma segura:', chapter.title);
  try {
    const margin = isABNT ? 30 : 20;
    let yPosition = margin + 20;
    
    // Título do capítulo com alinhamento
    doc.setFontSize(isABNT ? 14 : 16);
    doc.setFont(undefined, 'bold');
    const chapterTitle = `${chapter.order_index || 'S/N'}. ${chapter.title.toUpperCase()}`;
    const titleAlignment = getAlignmentX(doc, alignment, margin);
    doc.text(chapterTitle, titleAlignment.x, yPosition, { align: titleAlignment.align });
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
    
    // Tentar adicionar imagens relacionadas ao capítulo
    const chapterImages = bookImages.filter(img => img.chapter_id === chapter.id);
    if (chapterImages.length > 0) {
      console.log(`🖼️ Encontradas ${chapterImages.length} imagens para o capítulo`);
      for (const image of chapterImages.slice(0, 3)) { // Máximo 3 imagens por capítulo
        try {
          await addImageToChapterSafe(doc, image, yPosition, margin);
          yPosition += 60; // Espaço para a imagem
        } catch (imgError) {
          console.warn('Erro ao adicionar imagem:', imgError);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na função addChapterContentSafe:', error);
    // Continuar mesmo com erro
  }
}

function updateTableOfContentsSafe(doc: any, chapters: any[], pageNumbers: number[], isABNT: boolean, alignment: string = 'left') {
  console.log('📋 Atualizando sumário de forma segura...');
  try {
    // Voltar para a página do sumário (página 3)
    const currentPage = doc.internal.getNumberOfPages();
    doc.setPage(3);
    
    const margin = isABNT ? 30 : 20;
    let yPosition = margin + 40; // Após o título "SUMÁRIO"
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    for (let i = 0; i < chapters.length && i < pageNumbers.length; i++) {
      const pageNum = pageNumbers[i]?.toString() || '?';
      
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
    
  } catch (error) {
    console.error('❌ Erro na função updateTableOfContentsSafe:', error);
    // Continuar mesmo com erro
  }
}

async function addImageToChapterSafe(doc: any, image: any, yPosition: number, margin: number) {
  console.log('🖼️ Adicionando imagem ao capítulo:', image.filename);
  try {
    if (!image.url) return;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout para imagens
    
    const response = await fetch(image.url, { 
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const imageBlob = await response.blob();
    const base64 = await blobToBase64Safe(imageBlob);
    
    // Adicionar imagem em tamanho menor
    const imgWidth = 100;
    const imgHeight = 60;
    
    if (yPosition + imgHeight > 270) {
      doc.addPage();
      yPosition = margin + 20;
    }
    
    doc.addImage(base64, 'JPEG', margin, yPosition, imgWidth, imgHeight);
    
    // Adicionar legenda se houver
    if (image.alt_text) {
      doc.setFontSize(10);
      doc.setFont(undefined, 'italic');
      doc.text(image.alt_text, margin, yPosition + imgHeight + 10);
    }
    
  } catch (error) {
    console.warn('Erro ao adicionar imagem:', error);
  }
}

// Função removida para evitar duplicação - usando a versão otimizada abaixo

// Função auxiliar para detectar formato de imagem
function detectImageFormat(mimeType: string): string {
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  if (mimeType.includes('gif')) return 'GIF';
  if (mimeType.includes('webp')) return 'WEBP';
  return 'JPEG'; // fallback
}

// Versão melhorada da conversão base64
async function blobToBase64Safe(blob: Blob): Promise<string> {
  console.log('🔄 Convertendo blob para base64...');
  
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Converter usando btoa nativo do Deno
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    
    const base64 = btoa(binary);
    console.log('✅ Conversão base64 concluída:', base64.length, 'chars');
    return base64;
  } catch (error) {
    console.error('❌ Erro na conversão base64:', error);
    throw new Error(`Falha na conversão base64: ${error.message}`);
  }
}

async function generateDOCX(book: any, chapters: any[], coverImage: any, bookImages: any[], options: any): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📘 Generating professional DOCX...');
  
  try {
    const children = [];

    // CAPA - Título principal
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: book.title.toUpperCase(),
            bold: true,
            size: 48, // 24pt em half-points
          }),
        ],
        alignment: "center",
        spacing: { 
          after: 800 // 20pt * 20 = 400 twips
        }
      })
    );

    // Descrição (se houver)
    if (book.description) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: book.description,
              size: 24, // 12pt
              italics: true,
            }),
          ],
          alignment: "center",
          spacing: { after: 600 }
        })
      );
    }

    // Data de geração
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Gerado em ${new Date().getFullYear()}`,
            size: 20, // 10pt
          }),
        ],
        alignment: "center",
        spacing: { after: 800 }
      })
    );

    // QUEBRA DE PÁGINA e SUMÁRIO
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "SUMÁRIO",
            bold: true,
            size: 32, // 16pt
          }),
        ],
        alignment: "center",
        spacing: { 
          before: 400,
          after: 600 
        },
        pageBreakBefore: true
      })
    );

    // Entradas do sumário
    chapters.forEach((chapter, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${chapter.order_index || (index + 1)}. ${chapter.title}`,
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 200 }
        })
      );
    });

    // CAPÍTULOS
    chapters.forEach((chapter, index) => {
      // Quebra de página para cada capítulo
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `CAPÍTULO ${chapter.order_index || (index + 1)}`,
              bold: true,
              size: 28, // 14pt
              allCaps: true,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          alignment: "center",
          spacing: { 
            before: 400,
            after: 400 
          },
          pageBreakBefore: true
        })
      );

      // Título do capítulo
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: chapter.title,
              bold: true,
              size: 24, // 12pt
            }),
          ],
          alignment: "center", 
          spacing: { after: 600 }
        })
      );

      // Conteúdo do capítulo
      if (chapter.content && chapter.content.trim()) {
        const paragraphs = chapter.content
          .split('\n')
          .filter((p: string) => p.trim().length > 0);
        
        paragraphs.forEach((para: string) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: 22, // 11pt
                }),
              ],
              alignment: "justify",
              spacing: { after: 200 },
              indent: { 
                firstLine: 360 // 0.25 inch = 360 twips
              }
            })
          );
        });
      } else {
        // Parágrafo vazio caso não haja conteúdo
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "[Conteúdo do capítulo a ser desenvolvido]",
                size: 22,
                italics: true,
              }),
            ],
            alignment: "center",
            spacing: { after: 400 }
          })
        );
      }
    });

    // Criar documento com estrutura básica
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch = 1440 twips
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: children,
        },
      ],
    });

    console.log('📦 Convertendo documento para buffer...');
    const buffer = await Packer.toBuffer(doc);
    
    console.log('✅ DOCX gerado com sucesso:', {
      bufferSize: buffer.byteLength,
      title: book.title,
      chapters: chapters.length
    });

    return {
      fileBuffer: new Uint8Array(buffer),
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      filename: `${book.title.replace(/[^a-zA-Z0-9\s]/g, '_').replace(/\s+/g, '_')}.docx`
    };

  } catch (error) {
    console.error('❌ Erro ao gerar DOCX:', error);
    throw new Error(`Falha na geração do DOCX: ${error.message}`);
  }
}

async function generateEPUB(book: any, chapters: any[]): Promise<{fileBuffer: Uint8Array, mimeType: string, filename: string}> {
  console.log('📚 Generating EPUB (as HTML)...');
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${book.title}</title>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Georgia, serif; 
            line-height: 1.6; 
            margin: 40px auto; 
            max-width: 800px;
            padding: 20px; 
          }
          h1 { 
            text-align: center; 
            margin-bottom: 40px; 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
          }
          h2 { 
            margin-top: 40px; 
            page-break-before: always; 
            color: #34495e;
            border-left: 4px solid #3498db;
            padding-left: 15px;
          }
          p { 
            text-indent: 1.5em; 
            margin-bottom: 1em; 
            text-align: justify;
          }
          .description {
            font-style: italic;
            background: #ecf0f1;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .chapter {
            margin-bottom: 30px;
          }
        </style>
    </head>
    <body>
        <h1>${book.title}</h1>
        ${book.description ? `<div class="description">${book.description}</div>` : ''}
        
        ${chapters.map(chapter => `
            <div class="chapter">
                <h2>Capítulo ${chapter.order_index || 'S/N'}: ${chapter.title}</h2>
                <div>${chapter.content ? chapter.content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('') : '<p>Sem conteúdo</p>'}</div>
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
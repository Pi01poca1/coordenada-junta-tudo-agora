import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnrichRequest {
  chapterId: string;
  text: string;
  goal: 'improve' | 'ideas' | 'expand' | 'grammar' | 'style';
}

// Local AI Provider - Heuristic rules
class LocalAIProvider {
  async enrich(text: string, goal: string): Promise<{ enrichedText: string; confidence: number }> {
    let enrichedText = text;
    let confidence = 0.7;

    switch (goal) {
      case 'improve':
        // Simple text improvements
        enrichedText = text
          .replace(/\b(muito|bem|mais)\b/g, (match) => {
            const alternatives = {
              'muito': ['extremamente', 'consideravelmente', 'notavelmente'],
              'bem': ['adequadamente', 'satisfatoriamente', 'apropriadamente'],
              'mais': ['adicionalmente', 'além disso', 'outrossim']
            };
            const alts = alternatives[match as keyof typeof alternatives];
            return alts[Math.floor(Math.random() * alts.length)];
          })
          .replace(/\.\s+/g, '. ')
          .replace(/,\s+/g, ', ');
        break;

      case 'expand':
        // Add descriptive elements
        enrichedText = text.replace(/(\w+)\s+(disse|falou|respondeu)/g, '$1 declarou com convicção');
        enrichedText = enrichedText.replace(/(\w+)\s+(andou|caminhou)/g, '$1 percorreu cautelosamente');
        break;

      case 'style':
        // Literary style improvements
        enrichedText = text
          .replace(/\be\s+/g, 'e então ')
          .replace(/\bmas\s+/g, 'contudo, ')
          .replace(/\bporque\s+/g, 'uma vez que ');
        break;

      case 'grammar':
        // Basic grammar fixes
        enrichedText = text
          .replace(/\bmim\s+/g, 'eu ')
          .replace(/\bonde\s+que\b/g, 'em que')
          .replace(/\baonde\s+/g, 'onde ');
        break;

      case 'ideas':
        // Add creative suggestions
        const ideas = [
          "Talvez adicionar uma descrição do ambiente aqui.",
          "Considere explorar os sentimentos do personagem.",
          "Que tal adicionar um diálogo mais específico?",
          "Pode ser interessante incluir detalhes sensoriais."
        ];
        enrichedText = text + "\n\n[SUGESTÃO: " + ideas[Math.floor(Math.random() * ideas.length)] + "]";
        confidence = 0.6;
        break;
    }

    return { enrichedText, confidence };
  }
}

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header missing')
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError) {
      console.error('Auth error:', authError)
      throw new Error('Invalid authentication: ' + authError.message)
    }
    
    if (!user) {
      throw new Error('User not found')
    }

    console.log('Authenticated user:', user.id)

    const { chapterId, text, goal }: EnrichRequest = await req.json()

    console.log('Looking for chapter:', chapterId)

    // Validate chapter ownership
    const { data: chapter, error: chapterError } = await supabaseClient
      .from('chapters')
      .select(`
        id, 
        book_id, 
        author_id,
        books!inner(owner_id)
      `)
      .eq('id', chapterId)
      .maybeSingle()

    console.log('Chapter query result:', { chapter, chapterError })

    if (chapterError) {
      console.error('Chapter query error:', chapterError)
      throw new Error('Database error: ' + chapterError.message)
    }
    
    if (!chapter) {
      throw new Error('Chapter not found')
    }

    // Check if user is author or book owner
    const isAuthor = chapter.author_id === user.id
    const bookData = Array.isArray(chapter.books) ? chapter.books[0] : chapter.books
    const isOwner = bookData?.owner_id === user.id
    
    if (!isAuthor && !isOwner) {
      throw new Error('Access denied')
    }

    // Use local AI provider
    const aiProvider = new LocalAIProvider()
    const result = await aiProvider.enrich(text, goal)

    // Log AI session
    const { error: logError } = await supabaseClient
      .from('ai_sessions')
      .insert({
        user_id: user.id,
        book_id: chapter.book_id,
        chapter_id: chapterId,
        provider: 'local',
        input_prompt: `${goal}: ${text.substring(0, 100)}...`,
        output_content: result.enrichedText
      })

    if (logError) {
      console.error('Failed to log AI session:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          originalText: text,
          enrichedText: result.enrichedText,
          goal,
          confidence: result.confidence,
          provider: 'local',
          wordCountBefore: text.split(' ').length,
          wordCountAfter: result.enrichedText.split(' ').length
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in ai-enrich function:', error)
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
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

// Enhanced AI Provider with better text processing
class LocalAIProvider {
  async enrich(text: string, goal: string): Promise<{ enrichedText: string; confidence: number }> {
    let enrichedText = text;
    let confidence = 0.8;

    // Analyze text context for better suggestions
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isDialogue = text.includes('"') || text.includes('—');
    const isNarrative = !isDialogue && sentences.length > 1;

    switch (goal) {
      case 'improve':
        // Advanced text improvements
        enrichedText = text
          // Replace common words with more sophisticated alternatives
          .replace(/\b(muito|bem|mais|coisa|pessoa)\b/gi, (match) => {
            const alternatives = {
              'muito': ['extremamente', 'consideravelmente', 'notavelmente', 'extraordinariamente'],
              'bem': ['adequadamente', 'magistralmente', 'primorosamente', 'habilmente'],
              'mais': ['adicionalmente', 'outrossim', 'ademais', 'igualmente'],
              'coisa': ['elemento', 'aspecto', 'fenômeno', 'questão'],
              'pessoa': ['indivíduo', 'sujeito', 'personagem', 'figura']
            };
            const alts = alternatives[match.toLowerCase() as keyof typeof alternatives];
            return alts ? alts[Math.floor(Math.random() * alts.length)] : match;
          })
          // Improve sentence structure
          .replace(/\b(E|Mas|Porque)\b/g, (match) => {
            const alternatives = {
              'E': ['Ademais,', 'Outrossim,', 'Além disso,', 'Por conseguinte,'],
              'Mas': ['Contudo,', 'Todavia,', 'Não obstante,', 'Entretanto,'],
              'Porque': ['uma vez que', 'dado que', 'visto que', 'em virtude de']
            };
            const alts = alternatives[match as keyof typeof alternatives];
            return alts[Math.floor(Math.random() * alts.length)];
          })
          // Clean up spacing
          .replace(/\s+/g, ' ')
          .replace(/\s*([,.!?])/g, '$1');
        break;

      case 'expand':
        // Context-aware expansion
        if (isDialogue) {
          enrichedText = text.replace(/(disse|falou|respondeu|murmurou)/gi, (match) => {
            const dialogueVerbs = ['declarou enfaticamente', 'murmurou pensativo', 'exclamou com fervor', 
                                 'respondeu cautelosamente', 'sussurrou misteriosamente', 'afirmou convictamente'];
            return dialogueVerbs[Math.floor(Math.random() * dialogueVerbs.length)];
          });
        } else {
          // Add sensory details and atmosphere
          enrichedText = text.replace(/\b(olhou|viu|sentiu|ouviu)\b/gi, (match) => {
            const sensoryExpansions = {
              'olhou': 'contemplou atentamente',
              'viu': 'observou com crescente interesse',
              'sentiu': 'experimentou uma sensação',
              'ouviu': 'percebeu distintamente'
            };
            return sensoryExpansions[match.toLowerCase() as keyof typeof sensoryExpansions] || match;
          });
          
          // Add environmental details
          if (sentences.length > 1) {
            const environmentalDetails = [
              ' O ambiente ao redor parecia sustentar a intensidade do momento.',
              ' Uma atmosfera peculiar permeava o espaço.',
              ' O silêncio que se seguiu era quase palpável.',
              ' O ar carregava uma tensão indescritível.'
            ];
            enrichedText += environmentalDetails[Math.floor(Math.random() * environmentalDetails.length)];
          }
        }
        break;

      case 'style':
        // Literary style enhancement
        enrichedText = text
          .replace(/\b(então|aí|daí)\b/gi, (match) => {
            const connectors = ['nesse momento', 'em seguida', 'posteriormente', 'subsequentemente'];
            return connectors[Math.floor(Math.random() * connectors.length)];
          })
          .replace(/\b(grande|pequeno|bonito|feio)\b/gi, (match) => {
            const descriptives = {
              'grande': ['majestoso', 'imponente', 'colossal', 'monumental'],
              'pequeno': ['diminuto', 'singelo', 'delicado', 'sutil'],
              'bonito': ['deslumbrante', 'esplêndido', 'magnífico', 'sublime'],
              'feio': ['repulsivo', 'grotesco', 'desagradável', 'abjeto']
            };
            const alts = descriptives[match.toLowerCase() as keyof typeof descriptives];
            return alts ? alts[Math.floor(Math.random() * alts.length)] : match;
          });
        break;

      case 'grammar':
        // Enhanced grammar correction
        enrichedText = text
          .replace(/\b(mim|eu)\s+(que|quem)/gi, 'eu que')
          .replace(/\bonde\s+que\b/gi, 'em que')
          .replace(/\baonde\s+/gi, 'onde ')
          .replace(/\b(tem|têm)\s+(que|de)\b/gi, 'deve')
          .replace(/\b(mais|mas)\b/gi, (match, offset) => {
            // Context-aware mais/mas correction
            const before = text.substring(0, offset).split(' ').pop() || '';
            const after = text.substring(offset + match.length).split(' ')[0] || '';
            
            if (['não', 'nada', 'nenhum'].includes(before.toLowerCase()) || 
                ['do', 'que', 'de'].includes(after.toLowerCase())) {
              return 'mais';
            } else if (['porém', 'contudo', 'entretanto'].some(word => 
                      text.toLowerCase().includes(word))) {
              return 'mas';
            }
            return match;
          });
        break;

      case 'ideas':
        // Context-specific creative suggestions
        const contextualIdeas = [];
        
        if (isDialogue) {
          contextualIdeas.push(
            "💭 Considere adicionar gestos ou expressões faciais aos diálogos",
            "💭 Que tal explorar as motivações ocultas por trás dessas palavras?",
            "💭 Adicione pausas dramáticas ou hesitações para criar tensão"
          );
        }
        
        if (isNarrative) {
          contextualIdeas.push(
            "💭 Explore os cinco sentidos para enriquecer a cena",
            "💭 Considere o contraste entre aparência e realidade",
            "💭 Adicione detalhes que revelem a personalidade dos personagens"
          );
        }
        
        if (words.some(w => ['amor', 'ódio', 'medo', 'alegria'].includes(w))) {
          contextualIdeas.push(
            "💭 Explore as nuances dessa emoção através de metáforas",
            "💭 Considere o impacto físico dessa emoção no personagem"
          );
        }
        
        // Fallback general ideas
        if (contextualIdeas.length === 0) {
          contextualIdeas.push(
            "💭 Considere adicionar um conflito interno ao personagem",
            "💭 Que tal introduzir um elemento de surpresa?",
            "💭 Explore as implicações mais profundas desta situação"
          );
        }
        
        const selectedIdea = contextualIdeas[Math.floor(Math.random() * contextualIdeas.length)];
        enrichedText = text + "\n\n" + selectedIdea;
        confidence = 0.85;
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

    const { chapterId, text, goal }: EnrichRequest = await req.json()

    console.log('Looking for chapter:', chapterId)

    // Validate chapter ownership
    const { data: chapter, error: chapterError } = await authedClient
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
    const { error: logError } = await authedClient
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PromptRequest {
  chapterId: string;
  text: string;
  context?: {
    genre?: string;
    mood?: string;
    style?: string;
  };
}

class LocalPromptGenerator {
  generateWritingPrompt(text: string, context: any = {}): { prompt: string; suggestions: string[]; confidence: number } {
    const { genre = 'general', mood = 'neutral', style = 'realistic' } = context;

    // Enhanced text analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const isDialogue = text.includes('"') || text.includes('—');
    const hasCharacters = /\b(ele|ela|personagem|protagonista|herói|heroína)\b/i.test(text);
    const isAction = /\b(correu|saltou|gritou|lutou|fugiu|atacou)\b/i.test(text);
    const isEmotional = /\b(amor|ódio|medo|alegria|tristeza|raiva|paixão)\b/i.test(text);
    
    let prompts = [];
    
    // Genre and mood-specific prompts
    if (genre && genre !== 'general') {
      switch (genre.toLowerCase()) {
        case 'romance':
          prompts.push(
            `Desenvolva a tensão romântica entre os personagens a partir desta cena: "${text.slice(-100)}"`,
            `Crie um momento íntimo que revele os sentimentos ocultos dos personagens baseado em: ${text.slice(0, 80)}...`,
            `Explore o conflito interno do protagonista sobre seus sentimentos: ${text.slice(-80)}`
          );
          break;
        case 'suspense':
          prompts.push(
            `Aumente a tensão e o mistério desenvolvendo: "${text.slice(-100)}"`,
            `Introduza uma reviravolta inesperada na narrativa a partir de: ${text.slice(0, 80)}...`,
            `Crie uma atmosfera de perigo iminente baseada em: ${text.slice(-80)}`
          );
          break;
        case 'fantasia':
          prompts.push(
            `Expanda o mundo mágico e suas regras a partir de: "${text.slice(-100)}"`,
            `Desenvolva os poderes e habilidades especiais dos personagens: ${text.slice(0, 80)}...`,
            `Crie uma profecia ou lenda que se conecte com: ${text.slice(-80)}`
          );
          break;
      }
    }
    
    // Context-specific prompts
    if (isDialogue) {
      prompts.push(
        `Continue este diálogo revelando mais sobre as motivações dos personagens: "${text.slice(-150)}"`,
        `Adicione subtexto e tensão não dita a esta conversa: ${text.slice(-100)}`,
        `Desenvolva o conflito através do diálogo iniciado em: ${text.slice(-120)}`
      );
    }
    
    if (hasCharacters) {
      prompts.push(
        `Aprofunde a caracterização e background deste personagem: ${text.slice(-100)}`,
        `Explore a psicologia e dilemas internos do protagonista baseado em: ${text.slice(0, 100)}...`,
        `Revele aspectos ocultos da personalidade através das ações em: ${text.slice(-80)}`
      );
    }
    
    if (isAction) {
      prompts.push(
        `Intensifique a sequência de ação desenvolvendo: "${text.slice(-100)}"`,
        `Adicione consequências dramáticas para a ação descrita em: ${text.slice(-80)}`,
        `Crie uma perseguição ou confronto épico a partir de: ${text.slice(0, 80)}...`
      );
    }
    
    if (isEmotional) {
      prompts.push(
        `Explore as profundezas emocionais e vulnerabilidades do personagem: ${text.slice(-100)}`,
        `Desenvolva como essa emoção afeta as decisões e ações: ${text.slice(-80)}`,
        `Crie um momento de catarse emocional baseado em: ${text.slice(0, 80)}...`
      );
    }
    
    // Mood-specific additions
    if (mood && mood !== 'neutral') {
      switch (mood.toLowerCase()) {
        case 'sombrio':
          prompts.push(
            `Intensifique a atmosfera sombria e melancólica: ${text.slice(-100)}`,
            `Explore os aspectos mais obscuros da situação em: ${text.slice(-80)}`
          );
          break;
        case 'esperançoso':
          prompts.push(
            `Desenvolva elementos de esperança e redenção: ${text.slice(-100)}`,
            `Crie um momento de luz em meio à escuridão: ${text.slice(-80)}`
          );
          break;
        case 'épico':
          prompts.push(
            `Eleve a narrativa para proporções épicas: ${text.slice(-100)}`,
            `Crie um momento heroico memorável: ${text.slice(-80)}`
          );
          break;
      }
    }
    
    // Fallback general prompts if none specific were added
    if (prompts.length === 0) {
      prompts = [
        `Continue a narrativa desenvolvendo as consequências de: "${text.slice(-100)}"`,
        `Aprofunde o conflito central da história a partir de: ${text.slice(0, 100)}...`,
        `Crie uma reviravolta dramática baseada nos eventos de: ${text.slice(-80)}`,
        `Desenvolva a atmosfera e ambiente da cena: ${text.slice(-100)}`,
        `Explore as motivações ocultas dos personagens em: ${text.slice(-80)}`
      ];
    }
    
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    // Generate contextual suggestions
    const suggestions = this.generateContextualSuggestions(text, genre, mood);

    return {
      prompt: selectedPrompt,
      suggestions,
      confidence: 0.88
    };
  }

  private generateContextualSuggestions(text: string, genre: string, mood: string): string[] {
    const suggestions = [];
    
    // Add perspective suggestions
    suggestions.push(
      `📝 Tente escrever esta cena sob a perspectiva de outro personagem`,
      `🔄 Reescreva este trecho mudando o tempo narrativo (passado/presente)`,
      `💭 Adicione pensamentos internos para revelar motivações ocultas`
    );
    
    // Add technical suggestions
    suggestions.push(
      `🎬 Use técnicas cinematográficas: close-up, panorâmica, slow motion`,
      `🎭 Adicione conflito através de objetivos contraditórios`,
      `⚡ Crie tensão através do que NÃO é dito`
    );
    
    // Add sensory suggestions
    suggestions.push(
      `👁️ Explore todos os cinco sentidos na descrição`,
      `🌡️ Use a temperatura e clima para refletir emoções`,
      `🎵 Adicione sons ambiente para criar atmosfera`
    );

    return suggestions;
  }

  private extractCharacters(text: string): string[] {
    const characters: string[] = [];
    
    // Look for character indicators
    const characterPatterns = [
      /\b(herói|heroína|protagonista|personagem principal)\b/gi,
      /\b(cavaleiro|guerreiro|mago|feiticeira)\b/gi,
      /\b(rei|rainha|príncipe|princesa)\b/gi,
      /\b(dragão|lobo|águia|cavalo)\b/gi
    ];

    characterPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        characters.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(characters)]; // Remove duplicates
  }

  private extractSetting(text: string): string | null {
    const settingPatterns = [
      { pattern: /\b(floresta|bosque|selva)\b/gi, result: 'ancient forest' },
      { pattern: /\b(castelo|fortaleza|torre)\b/gi, result: 'medieval castle' },
      { pattern: /\b(montanha|pico|rochedo)\b/gi, result: 'mountain landscape' },
      { pattern: /\b(cidade|vila|aldeia)\b/gi, result: 'fantasy village' },
      { pattern: /\b(caverna|gruta|subterrâneo)\b/gi, result: 'mysterious cave' },
      { pattern: /\b(mar|oceano|lago)\b/gi, result: 'vast waters' }
    ];

    for (const { pattern, result } of settingPatterns) {
      if (pattern.test(text)) {
        return result;
      }
    }

    return null;
  }

  private extractAction(text: string): string | null {
    const actionPatterns = [
      { pattern: /\b(batalha|luta|combate)\b/gi, result: 'epic battle scene' },
      { pattern: /\b(viagem|jornada|caminhada)\b/gi, result: 'journey in progress' },
      { pattern: /\b(encontro|reunião|conversa)\b/gi, result: 'character meeting' },
      { pattern: /\b(descoberta|revelação|mistério)\b/gi, result: 'moment of discovery' }
    ];

    for (const { pattern, result } of actionPatterns) {
      if (pattern.test(text)) {
        return result;
      }
    }

    return null;
  }

  private extractEmotions(text: string): string[] {
    const emotions: string[] = [];
    const emotionPatterns = [
      /\b(medo|terror|horror)\b/gi,
      /\b(alegria|felicidade|êxtase)\b/gi,
      /\b(tristeza|melancolia|saudade)\b/gi,
      /\b(raiva|ira|fúria)\b/gi,
      /\b(esperança|otimismo)\b/gi
    ];

    emotionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        emotions.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(emotions)];
  }

  private getGenreElements(genre: string): string | null {
    const genreMap: Record<string, string> = {
      'fantasia': 'magical elements, mystical atmosphere',
      'ficção científica': 'futuristic technology, sci-fi elements',
      'romance': 'romantic atmosphere, soft lighting',
      'terror': 'dark shadows, ominous mood',
      'aventura': 'dynamic action, adventurous spirit',
      'drama': 'emotional depth, dramatic lighting'
    };

    return genreMap[genre.toLowerCase()] || null;
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
      throw new Error('Authentication required')
    }

    const { chapterId, text, context }: PromptRequest = await req.json()

    // Validate chapter ownership
    const { data: chapter, error: chapterError } = await authedClient
      .from('chapters')
      .select('id, book_id, author_id, books(owner_id)')
      .eq('id', chapterId)
      .single()

    if (chapterError || !chapter) {
      throw new Error('Chapter not found')
    }

    // Check if user is author or book owner
    const isAuthor = chapter.author_id === user.id
    const isOwner = (chapter.books as any)?.owner_id === user.id
    
    if (!isAuthor && !isOwner) {
      throw new Error('Access denied')
    }

    // Generate prompt using local AI
    const promptGenerator = new LocalPromptGenerator()
    const result = promptGenerator.generateWritingPrompt(text, context)

    // Log AI session
    const { error: logError } = await authedClient
      .from('ai_sessions')
      .insert({
        user_id: user.id,
        book_id: chapter.book_id,
        chapter_id: chapterId,
        provider: 'local',
        input_prompt: `Image prompt for: ${text.substring(0, 100)}...`,
        output_content: result.prompt
      })

    if (logError) {
      console.error('Failed to log AI session:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          prompt: result.prompt,
          suggestions: result.suggestions,
          confidence: result.confidence,
          provider: 'local',
          context: context || {}
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in ai-prompt function:', error)
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
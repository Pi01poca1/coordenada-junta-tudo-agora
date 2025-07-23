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
  generateImagePrompt(text: string, context: any = {}): { prompt: string; suggestions: string[]; confidence: number } {
    const { genre = 'general', mood = 'neutral', style = 'realistic' } = context;

    // Extract key elements from text
    const characters = this.extractCharacters(text);
    const setting = this.extractSetting(text);
    const action = this.extractAction(text);
    const emotions = this.extractEmotions(text);

    // Build base prompt
    let prompt = '';
    
    if (setting) {
      prompt += `${setting}, `;
    }
    
    if (characters.length > 0) {
      prompt += `featuring ${characters.join(' and ')}, `;
    }
    
    if (action) {
      prompt += `${action}, `;
    }

    // Add style and mood
    prompt += `${style} style, ${mood} atmosphere`;
    
    // Add genre-specific elements
    const genreElements = this.getGenreElements(genre);
    if (genreElements) {
      prompt += `, ${genreElements}`;
    }

    // Generate alternative suggestions
    const suggestions = [
      `Wide angle view: ${prompt}, cinematic composition`,
      `Close-up focus: ${prompt}, detailed portrait`,
      `Atmospheric scene: ${prompt}, dramatic lighting`,
      `Minimalist approach: ${prompt}, simple composition`
    ];

    return {
      prompt: prompt.trim(),
      suggestions,
      confidence: 0.75
    };
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
    const result = promptGenerator.generateImagePrompt(text, context)

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
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { strictRateLimiter } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Rate limiting strict (endpoint IA coûteux)
  const rateLimitResponse = await strictRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Authentification obligatoire
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { prompt, max_tokens = 500, temperature = 0.7 } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 });
    }

    if (prompt.length > 2000) {
      return NextResponse.json({ error: 'Prompt trop long (max 2000 caractères)' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ content: null, error: 'OpenAI non configuré' }, { status: 503 });
    }

    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(max_tokens, 1000),
      temperature: Math.max(0, Math.min(2, temperature)),
    });

    return NextResponse.json({ content: completion.choices[0]?.message?.content ?? null });
  } catch {
    return NextResponse.json({ content: null, error: 'Erreur IA' }, { status: 500 });
  }
}

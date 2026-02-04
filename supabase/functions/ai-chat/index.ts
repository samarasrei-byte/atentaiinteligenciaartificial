import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const logStep = (step: string, details?: Record<string, unknown>) => {
  console.log(`[AI-CHAT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
};

// Rate limiting function
async function checkRateLimit(
  supabaseClient: any,
  identifier: string,
  endpoint: string,
  maxRequests: number = 30,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; retryAfter?: number }> {
  try {
    const { data, error } = await supabaseClient.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      logStep('Rate limit check error', { error: error.message });
      // On error, allow the request (fail open)
      return { allowed: true, remaining: maxRequests };
    }

    const result = data as { allowed: boolean; remaining: number; retry_after?: number };
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfter: result.retry_after,
    };
  } catch (error) {
    logStep('Rate limit exception', { error: String(error) });
    return { allowed: true, remaining: maxRequests };
  }
}

const SYSTEM_PROMPT = `Você é o AtentAI, assistente de legislação tributária brasileira focado na Reforma Tributária 2026.

CONHECIMENTO PRINCIPAL:
- IBS (substitui ICMS/ISS): alíquota 17,7%, princípio do destino
- CBS (substitui PIS/COFINS): alíquota 8,8%
- IS (Imposto Seletivo): cigarros, bebidas, combustíveis fósseis
- Transição: 2026-2033 (gradual)
- Regimes: MEI, Simples Nacional, Lucro Presumido, Lucro Real

REGRAS DE RESPOSTA:
1. Seja direto e objetivo, respostas curtas
2. NÃO use asteriscos, negritos ou formatação markdown
3. Use parágrafos simples e listas com hífens quando necessário
4. Cite valores e alíquotas quando relevante
5. Sugira contador para casos complexos
6. Responda em português brasileiro

LIMITAÇÕES:
- Não forneça pareceres jurídicos definitivos
- Recomende validação com contador/advogado`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create service role client for rate limiting
  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    logStep('Request started');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    logStep('User authenticated', { userId: user.id });

    // Check rate limit (30 requests per minute for AI chat)
    const rateLimit = await checkRateLimit(serviceClient, user.id, 'ai-chat', 30, 60);
    
    if (!rateLimit.allowed) {
      logStep('Rate limit exceeded', { userId: user.id, retryAfter: rateLimit.retryAfter });
      return new Response(JSON.stringify({ 
        error: 'Limite de requisições excedido. Tente novamente em alguns segundos.',
        retryAfter: rateLimit.retryAfter
      }), {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(rateLimit.retryAfter || 60),
          'X-RateLimit-Remaining': '0'
        },
      });
    }

    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA esgotados.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erro no serviço de IA' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'X-RateLimit-Remaining': String(rateLimit.remaining)
      },
    });
  } catch (error: unknown) {
    // Log full error details server-side only
    console.error('Error in ai-chat function:', error);
    // Return generic error message to client
    return new Response(JSON.stringify({ error: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

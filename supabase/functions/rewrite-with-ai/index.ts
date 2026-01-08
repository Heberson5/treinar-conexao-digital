import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, provedor } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Texto não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mapear provedor para modelo do Lovable AI
    let model = "google/gemini-2.5-flash"; // default
    
    if (provedor === "chatgpt") {
      model = "openai/gpt-5-mini";
    } else if (provedor === "deepseek") {
      // DeepSeek não está disponível diretamente, usar Gemini como fallback
      model = "google/gemini-2.5-flash";
    }

    const systemPrompt = `Você é um assistente especializado em reescrever textos de treinamentos corporativos.
Sua função é melhorar a clareza, legibilidade e compreensão do texto fornecido.

Regras:
- Mantenha o significado original do texto
- Use linguagem clara e objetiva
- Quebre parágrafos longos em partes menores
- Use bullet points quando apropriado
- Mantenha um tom profissional mas acessível
- Não adicione informações que não estavam no texto original
- Se o texto contiver HTML, preserve as tags HTML básicas (h3, p, strong, em, ul, li)
- Responda APENAS com o texto reescrito, sem comentários adicionais`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Reescreva o seguinte texto de treinamento de forma clara e fácil de entender:\n\n${text}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar a solicitação de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rewrittenText = data.choices?.[0]?.message?.content;

    if (!rewrittenText) {
      return new Response(
        JSON.stringify({ error: "Não foi possível reescrever o texto" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ rewrittenText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in rewrite-with-ai function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

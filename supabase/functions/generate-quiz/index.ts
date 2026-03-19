import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conteudo, configuracoes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!conteudo || conteudo.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Conteúdo do treinamento não fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // configuracoes: array of { tipo: string, quantidade: number }
    const tiposConfig = configuracoes || [{ tipo: "quiz", quantidade: 5 }];
    const totalQuestoes = tiposConfig.reduce((acc: number, c: any) => acc + c.quantidade, 0);

    const tipoDescriptions: Record<string, string> = {
      quiz: "Múltipla escolha com 4 alternativas (A, B, C, D) e apenas uma correta",
      "verdadeiro-falso": "Verdadeiro ou Falso - apenas 2 opções",
      "resposta-curta": "Resposta curta - uma palavra ou frase curta como resposta correta",
      slider: "Controle deslizante - resposta numérica entre um valor mínimo e máximo",
      puzzle: "Puzzle - ordenar itens na sequência correta (4 itens)",
      escala: "Escala - classificar em uma escala de 1 a 5 ou 1 a 10",
    };

    const tipoInstructions = tiposConfig.map((c: any) => 
      `- ${c.quantidade} questão(ões) do tipo "${c.tipo}": ${tipoDescriptions[c.tipo] || c.tipo}`
    ).join("\n");

    const systemPrompt = `Você é um especialista em criar avaliações educacionais rigorosas baseadas em conteúdo de treinamento.

REGRAS IMPORTANTES:
- Crie questões que REALMENTE AVALIEM o conhecimento, não facilite
- Inclua "pegadinhas" inteligentes - alternativas que parecem corretas mas não são
- As alternativas incorretas devem ser plausíveis e baseadas no conteúdo
- Varie a dificuldade entre as questões
- As questões devem cobrir diferentes partes do conteúdo
- Retorne APENAS o JSON válido, sem markdown ou texto extra

FORMATO DE SAÍDA (JSON array):`;

    const userPrompt = `Com base no seguinte conteúdo de treinamento, crie exatamente ${totalQuestoes} questões:

${tipoInstructions}

CONTEÚDO DO TREINAMENTO:
${conteudo.substring(0, 8000)}

Retorne um JSON array com objetos no seguinte formato:
[
  {
    "tipo": "quiz",
    "pergunta": "Pergunta aqui?",
    "opcoes": ["Opção A", "Opção B", "Opção C", "Opção D"],
    "resposta_correta": "a",
    "ordem": 0
  },
  {
    "tipo": "verdadeiro-falso",
    "pergunta": "Afirmação aqui",
    "opcoes": ["Verdadeiro", "Falso"],
    "resposta_correta": "a",
    "ordem": 1
  },
  {
    "tipo": "resposta-curta",
    "pergunta": "Pergunta aqui?",
    "opcoes": [],
    "resposta_correta": "resposta esperada",
    "ordem": 2
  },
  {
    "tipo": "slider",
    "pergunta": "Qual é o valor de X?",
    "opcoes": [],
    "resposta_correta": "42",
    "valor_minimo": 0,
    "valor_maximo": 100,
    "passo": 1,
    "ordem": 3
  },
  {
    "tipo": "puzzle",
    "pergunta": "Ordene os passos corretamente:",
    "opcoes": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
    "resposta_correta": "0,1,2,3",
    "ordem": 4
  },
  {
    "tipo": "escala",
    "pergunta": "De 1 a 5, qual o nível de importância?",
    "opcoes": [],
    "resposta_correta": "4",
    "valor_minimo": 1,
    "valor_maximo": 5,
    "passo": 1,
    "ordem": 5
  }
]

IMPORTANTE: Retorne APENAS o JSON array válido.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
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
          JSON.stringify({ error: "Créditos de IA esgotados." }),
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
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean up potential markdown wrapping
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let questoes;
    try {
      questoes = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(
        JSON.stringify({ error: "Erro ao interpretar resposta da IA. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ questoes }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-quiz:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-setup-secret",
};

// Constant-time-ish string compare
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const setupSecret = Deno.env.get("SETUP_MASTER_SECRET");
    if (!setupSecret) {
      // If the deployment operator has not configured the secret, the endpoint is disabled.
      return new Response(
        JSON.stringify({ error: "Endpoint indisponível" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const provided = req.headers.get("x-setup-secret") || "";
    if (!provided || !safeEqual(provided, setupSecret)) {
      console.warn("setup-master: unauthorized attempt from", req.headers.get("x-forwarded-for") || "unknown");
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { email, password, nome } = await req.json();

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return new Response(
        JSON.stringify({ error: "Email e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já existe um master
    const { data: existingMasters } = await supabaseAdmin
      .from("usuario_roles")
      .select("usuario_id")
      .eq("role", "master")
      .limit(1);

    if (existingMasters && existingMasters.length > 0) {
      return new Response(
        JSON.stringify({ error: "Operação não permitida" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || "Master Admin" },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: "Falha ao criar usuário" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;

    await supabaseAdmin
      .from("usuario_roles")
      .update({ role: "master" })
      .eq("usuario_id", userId);

    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("setup-master error:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

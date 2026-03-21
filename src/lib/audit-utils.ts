import { supabase } from "@/integrations/supabase/client";

interface AuditLogEntry {
  acao: string;
  menu: string;
  local?: string;
  descricao: string;
  dados_anteriores?: Record<string, any>;
  dados_novos?: Record<string, any>;
}

export async function registrarAuditoria(entry: AuditLogEntry) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome")
      .eq("id", user.id)
      .single();

    await supabase.from("auditoria" as any).insert({
      usuario_id: user.id,
      usuario_nome: perfil?.nome || user.email || "Desconhecido",
      acao: entry.acao,
      menu: entry.menu,
      local: entry.local,
      descricao: entry.descricao,
      dados_anteriores: entry.dados_anteriores || null,
      dados_novos: entry.dados_novos || null,
    } as any);
  } catch (error) {
    console.error("Erro ao registrar auditoria:", error);
  }
}

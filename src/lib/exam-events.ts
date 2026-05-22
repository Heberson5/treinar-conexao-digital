import { supabase } from "@/integrations/supabase/client";

export type TipoEventoTentativa =
  | "estudo_iniciado"
  | "estudo_pausado"
  | "estudo_retomado"
  | "avaliacao_iniciada"
  | "avaliacao_violacao"
  | "avaliacao_reiniciada"
  | "avaliacao_finalizada";

export async function registrarEventoTentativa(
  tipo: TipoEventoTentativa,
  treinamentoId: string,
  detalhes: Record<string, any> = {}
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any).from("tentativas_eventos").insert({
      usuario_id: user.id,
      treinamento_id: treinamentoId,
      tipo_evento: tipo,
      detalhes,
    });
  } catch (e) {
    console.error("Erro ao registrar evento de tentativa:", e);
  }
}

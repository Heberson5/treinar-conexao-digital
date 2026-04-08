import { supabase } from "@/integrations/supabase/client"

export async function registrarAtividade(
  tipo: string,
  descricao: string,
  metadata?: Record<string, any>
) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("atividades").insert({
      usuario_id: user.id,
      tipo,
      descricao,
      metadata: metadata || {}
    })
  } catch (error) {
    console.error("Erro ao registrar atividade:", error)
  }
}

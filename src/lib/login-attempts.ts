import { supabase } from "@/integrations/supabase/client";

export interface LoginAttemptCheck {
  permitido: boolean;
  tentativas: number;
  max: number;
  restantes?: number;
  desbloqueio_em?: string;
}

export async function podeTeentarLogin(email: string): Promise<LoginAttemptCheck> {
  const { data, error } = await supabase.rpc("pode_tentar_login" as any, {
    p_email: email,
  });
  if (error) {
    // Em caso de falha, permite tentar (fail-open)
    return { permitido: true, tentativas: 0, max: 5 };
  }
  return data as LoginAttemptCheck;
}

export async function registrarTentativaLogin(email: string, sucesso: boolean) {
  await supabase.rpc("registrar_tentativa_login" as any, {
    p_email: email,
    p_sucesso: sucesso,
  });
}

export function formatarDesbloqueio(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

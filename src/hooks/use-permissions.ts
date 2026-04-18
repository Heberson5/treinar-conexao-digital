import { useAuth, TipoRole } from "@/contexts/auth-context";

/**
 * Mapa de permissões por papel (role).
 * IMPORTANTE: alterações aqui devem refletir na tela de "Gestão de Papéis" (/admin/permissoes).
 *
 * Permissões sensíveis (controladas pelo Master):
 * - trainings.upload_video → Permite o upload de arquivo de vídeo. Quando ausente,
 *   o usuário só pode informar o link (YouTube/URL externa).
 */
const PERMISSOES_POR_ROLE: Record<TipoRole, string[]> = {
  master: [
    "trainings.upload_video",
    "trainings.create",
    "trainings.edit",
    "trainings.delete",
    "trainings.manage",
    "users.manage",
    "*", // master tem tudo
  ],
  admin: [
    "trainings.create",
    "trainings.edit",
    "trainings.delete",
    "trainings.manage",
    "users.manage",
    // upload de vídeo NÃO incluído por padrão — Master concede
  ],
  instrutor: [
    "trainings.create",
    "trainings.edit",
    // upload de vídeo NÃO incluído por padrão — Master concede
  ],
  usuario: [],
};

export function usePermissions() {
  const { user } = useAuth();

  const role: TipoRole = user?.role ?? "usuario";

  const has = (permissionId: string): boolean => {
    if (!user) return false;
    if (role === "master") return true;
    const list = PERMISSOES_POR_ROLE[role] || [];
    return list.includes("*") || list.includes(permissionId);
  };

  return {
    role,
    has,
    canUploadVideo: has("trainings.upload_video"),
    isMaster: role === "master",
  };
}

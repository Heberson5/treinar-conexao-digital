CREATE OR REPLACE FUNCTION public.listar_usuarios_visiveis_admin()
RETURNS TABLE (
  id uuid,
  nome text,
  email text,
  empresa_id uuid,
  departamento_id uuid,
  cargo text,
  ativo boolean,
  trocar_senha_primeiro_login boolean,
  dias_para_trocar_senha integer,
  papel public.tipo_role
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    p.id,
    p.nome,
    p.email,
    p.empresa_id,
    p.departamento_id,
    p.cargo,
    COALESCE(p.ativo, true) AS ativo,
    COALESCE(p.trocar_senha_primeiro_login, false) AS trocar_senha_primeiro_login,
    p.dias_para_trocar_senha,
    COALESCE(ur.role, 'usuario'::public.tipo_role) AS papel
  FROM public.perfis p
  LEFT JOIN public.usuario_roles ur ON ur.usuario_id = p.id
  WHERE
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (
      public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
      AND p.empresa_id IS NOT NULL
      AND p.empresa_id = public.get_empresa_id_do_usuario(auth.uid())
      AND COALESCE(ur.role, 'usuario'::public.tipo_role) <> 'master'::public.tipo_role
    )
  ORDER BY p.nome ASC NULLS LAST, p.email ASC;
$$;

GRANT EXECUTE ON FUNCTION public.listar_usuarios_visiveis_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.pode_tentar_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(COALESCE(p_email, '')));
  v_max integer;
  v_horas integer;
  v_falhas integer;
  v_ultima_falha timestamptz;
  v_proxima_tentativa timestamptz;
BEGIN
  SELECT tentativas_login_max, bloqueio_horas
    INTO v_max, v_horas
  FROM public.configuracoes_sistema
  LIMIT 1;

  v_max := COALESCE(v_max, 5);
  v_horas := COALESCE(v_horas, 24);

  SELECT COUNT(*), MAX(criado_em)
    INTO v_falhas, v_ultima_falha
  FROM public.tentativas_login
  WHERE email = v_email
    AND sucesso = false
    AND criado_em > now() - (v_horas || ' hours')::interval
    AND criado_em > COALESCE(
      (SELECT MAX(criado_em) FROM public.tentativas_login
        WHERE email = v_email AND sucesso = true),
      'epoch'::timestamptz
    );

  IF v_falhas >= v_max THEN
    v_proxima_tentativa := v_ultima_falha + (v_horas || ' hours')::interval;
    RETURN jsonb_build_object(
      'permitido', false,
      'tentativas', v_falhas,
      'max', v_max,
      'desbloqueio_em', v_proxima_tentativa
    );
  END IF;

  RETURN jsonb_build_object(
    'permitido', true,
    'tentativas', v_falhas,
    'restantes', v_max - v_falhas,
    'max', v_max
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.pode_tentar_login(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.registrar_tentativa_login(p_email text, p_sucesso boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tentativas_login (email, sucesso)
  VALUES (lower(trim(COALESCE(p_email, ''))), p_sucesso);
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_tentativa_login(text, boolean) TO anon, authenticated;
-- Fix empresas: restrict SELECT to user's own empresa or admin/master
DROP POLICY IF EXISTS "Empresas visiveis para usuarios autenticados" ON public.empresas;

CREATE POLICY "Usuarios veem propria empresa ou admin ve todas"
ON public.empresas FOR SELECT
TO authenticated
USING (
  id = public.get_empresa_id_do_usuario(auth.uid())
  OR public.eh_admin_ou_master(auth.uid())
);

-- Fix departamentos: restrict SELECT to user's own empresa or admin/master
DROP POLICY IF EXISTS "Departamentos visiveis para usuarios autenticados" ON public.departamentos;

CREATE POLICY "Departamentos visiveis para empresa do usuario"
ON public.departamentos FOR SELECT
TO authenticated
USING (
  empresa_id = public.get_empresa_id_do_usuario(auth.uid())
  OR public.eh_admin_ou_master(auth.uid())
);

-- Strengthen usuario_roles: split master ALL into INSERT/UPDATE/DELETE with explicit WITH CHECK,
-- and prevent self-modification of own role
DROP POLICY IF EXISTS "Apenas master pode gerenciar roles" ON public.usuario_roles;

CREATE POLICY "Master pode criar roles para outros"
ON public.usuario_roles FOR INSERT
TO authenticated
WITH CHECK (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  AND usuario_id <> auth.uid()
);

CREATE POLICY "Master pode atualizar roles de outros"
ON public.usuario_roles FOR UPDATE
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  AND usuario_id <> auth.uid()
)
WITH CHECK (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  AND usuario_id <> auth.uid()
);

CREATE POLICY "Master pode deletar roles de outros"
ON public.usuario_roles FOR DELETE
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  AND usuario_id <> auth.uid()
);

-- Harden SECURITY DEFINER function criar_contrato_plano with authorization + input validation
CREATE OR REPLACE FUNCTION public.criar_contrato_plano(p_empresa_id uuid, p_plano_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_plano RECORD;
  v_contrato_id UUID;
BEGIN
  -- Validate inputs
  IF p_empresa_id IS NULL OR p_plano_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros inválidos';
  END IF;

  -- Authorization: caller must be master, OR admin of the same empresa
  IF NOT (
    public.verificar_role(auth.uid(), 'master'::tipo_role)
    OR (
      public.eh_admin_ou_master(auth.uid())
      AND public.get_empresa_id_do_usuario(auth.uid()) = p_empresa_id
    )
  ) THEN
    RAISE EXCEPTION 'Não autorizado a contratar plano para esta empresa';
  END IF;

  -- Verify empresa exists
  IF NOT EXISTS (SELECT 1 FROM public.empresas WHERE id = p_empresa_id) THEN
    RAISE EXCEPTION 'Empresa não encontrada';
  END IF;

  SELECT * INTO v_plano FROM public.planos WHERE id = p_plano_id AND ativo = true;
  IF v_plano IS NULL THEN
    RAISE EXCEPTION 'Plano não encontrado ou inativo';
  END IF;

  UPDATE public.plano_contratos
  SET ativo = false, data_fim = now()
  WHERE empresa_id = p_empresa_id AND ativo = true;

  INSERT INTO public.plano_contratos (
    empresa_id, plano_id, nome_plano, preco_contratado,
    limite_usuarios, limite_treinamentos, limite_armazenamento_gb, recursos_contratados
  ) VALUES (
    p_empresa_id, p_plano_id, v_plano.nome, v_plano.preco,
    v_plano.limite_usuarios, v_plano.limite_treinamentos,
    v_plano.limite_armazenamento_gb, v_plano.recursos
  ) RETURNING id INTO v_contrato_id;

  INSERT INTO public.uso_empresa (empresa_id)
  VALUES (p_empresa_id)
  ON CONFLICT (empresa_id) DO NOTHING;

  RETURN v_contrato_id;
END;
$function$;

-- Harden registrar_cnpj_demo with CNPJ format validation
CREATE OR REPLACE FUNCTION public.registrar_cnpj_demo(p_cnpj text, p_empresa_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_cnpj IS NULL OR p_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Parâmetros inválidos';
  END IF;

  -- CNPJ must be 14 digits (after stripping non-digits)
  IF length(regexp_replace(p_cnpj, '\D', '', 'g')) <> 14 THEN
    RAISE EXCEPTION 'CNPJ inválido';
  END IF;

  INSERT INTO public.cnpj_demo_usado (cnpj, empresa_id)
  VALUES (p_cnpj, p_empresa_id)
  ON CONFLICT (cnpj) DO NOTHING;
END;
$function$;

-- Harden verificar_cnpj_demo_disponivel with CNPJ format validation
CREATE OR REPLACE FUNCTION public.verificar_cnpj_demo_disponivel(p_cnpj text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF p_cnpj IS NULL OR length(regexp_replace(p_cnpj, '\D', '', 'g')) <> 14 THEN
    RETURN false;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1 FROM public.cnpj_demo_usado
    WHERE cnpj = p_cnpj
  );
END;
$function$;
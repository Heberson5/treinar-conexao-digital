
CREATE OR REPLACE FUNCTION public.criar_perfil_usuario()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_empresa_id uuid;
  v_is_demo boolean;
  v_role tipo_role;
BEGIN
  INSERT INTO public.perfis (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  
  -- Check if user's empresa (if any) is a demo company
  v_role := 'usuario';
  
  -- If empresa_id was passed in metadata
  v_empresa_id := (NEW.raw_user_meta_data ->> 'empresa_id')::uuid;
  IF v_empresa_id IS NOT NULL THEN
    SELECT is_demo INTO v_is_demo FROM public.empresas WHERE id = v_empresa_id;
    IF v_is_demo = true THEN
      v_role := 'admin';
    END IF;
    -- Update perfil with empresa_id
    UPDATE public.perfis SET empresa_id = v_empresa_id WHERE id = NEW.id;
  END IF;
  
  -- Atribuir role
  INSERT INTO public.usuario_roles (usuario_id, role)
  VALUES (NEW.id, v_role);
  
  RETURN NEW;
END;
$function$;

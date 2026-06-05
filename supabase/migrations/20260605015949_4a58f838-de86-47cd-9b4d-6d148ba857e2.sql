
CREATE TABLE IF NOT EXISTS public.access_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_general boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_roles TO anon, authenticated;
GRANT ALL ON public.access_roles TO service_role;

ALTER TABLE public.access_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS access_roles_all_public ON public.access_roles;
CREATE POLICY access_roles_all_public ON public.access_roles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP TRIGGER IF EXISTS access_roles_set_updated_at ON public.access_roles;
CREATE TRIGGER access_roles_set_updated_at BEFORE UPDATE ON public.access_roles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.verify_access_password(p_password text)
RETURNS TABLE(id uuid, name text, permissions jsonb, is_general boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT id, name, permissions, is_general
  FROM public.access_roles
  WHERE is_active = true
    AND password_hash = extensions.crypt(p_password, password_hash)
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.verify_access_password(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_access_role_password(p_id uuid, p_password text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  UPDATE public.access_roles
  SET password_hash = extensions.crypt(p_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = p_id;
$$;
GRANT EXECUTE ON FUNCTION public.set_access_role_password(uuid, text) TO anon, authenticated;

INSERT INTO public.access_roles (name, password_hash, permissions, is_general)
VALUES (
  'General',
  extensions.crypt('General2323', extensions.gen_salt('bf')),
  jsonb_build_object(
    'dashboard','edit',
    'operatsiyalar','edit',
    'nastroyka.accounts','edit',
    'nastroyka.sources','edit',
    'nastroyka.charge_types','edit',
    'nastroyka.exchange_rates','edit',
    'nastroyka.contragents','edit',
    'nastroyka.employees','edit',
    'nastroyka.dealers','edit',
    'nastroyka.products','edit',
    'nastroyka.unit_types','edit',
    'nastroyka.access_roles','edit'
  ),
  true
)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['accounts','sources','charge_types','exchange_rates','contragents','employees','dealers','products','unit_types','transactions']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_all_authenticated ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS %I_all_public ON public.%I', t, t);
    EXECUTE format('CREATE POLICY %I_all_public ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
  END LOOP;
END $$;

DROP POLICY IF EXISTS audit_log_insert_authenticated ON public.audit_log;
DROP POLICY IF EXISTS audit_log_insert_public ON public.audit_log;
CREATE POLICY audit_log_insert_public ON public.audit_log FOR INSERT TO anon, authenticated WITH CHECK (true);
GRANT INSERT ON public.audit_log TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.audit_log_id_seq TO anon;


-- Ensure all SECURITY DEFINER functions have explicit search_path (already set, but normalize)
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- Revoke public/anon/authenticated EXECUTE on definer functions used internally
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- has_role / has_any_role need to be callable from RLS policies as authenticated
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(UUID) TO authenticated;

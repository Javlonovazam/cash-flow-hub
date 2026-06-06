GRANT SELECT ON public.audit_log TO anon;

DROP POLICY IF EXISTS audit_log_select_public_app ON public.audit_log;
CREATE POLICY audit_log_select_public_app
ON public.audit_log
FOR SELECT
TO anon
USING (true);
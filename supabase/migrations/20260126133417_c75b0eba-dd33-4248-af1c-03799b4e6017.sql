-- Security hardening: remove hardcoded admin email/backdoor behavior
-- Keep the existing trigger intact but make the function a safe no-op.

CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Previously this function auto-assigned the 'admin' role based on a hardcoded email.
  -- That pattern leaks privileged identity and creates an implicit backdoor.
  -- Admin roles must be assigned explicitly via the user_roles table by an existing admin.
  RETURN NEW;
END;
$$;
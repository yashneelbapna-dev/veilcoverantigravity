-- Step 1: Create a secure function to record login attempts
-- This function validates and records login attempts securely
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  attempt_email text,
  attempt_success boolean,
  attempt_ip_address text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate email format (basic check)
  IF attempt_email IS NULL OR attempt_email = '' OR position('@' in attempt_email) = 0 THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Insert the login attempt
  INSERT INTO public.login_attempts (email, success, ip_address)
  VALUES (attempt_email, attempt_success, attempt_ip_address);
END;
$$;

-- Step 2: Revoke direct table INSERT from public/anon
-- First drop the existing permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can record login attempts" ON public.login_attempts;

-- Step 3: Create a restrictive INSERT policy that only allows service_role
-- This prevents direct table inserts from clients
CREATE POLICY "Only service role can insert login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

-- Grant execute on the new function to anon and authenticated (for login flows)
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, text) TO anon;
GRANT EXECUTE ON FUNCTION public.record_login_attempt(text, boolean, text) TO authenticated;
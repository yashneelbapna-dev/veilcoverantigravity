-- Fix newsletter_emails: Explicitly deny SELECT access to prevent email harvesting
CREATE POLICY "Deny public read access to newsletter emails"
ON public.newsletter_emails
FOR SELECT
USING (false);

-- Fix login_attempts: Only admins can view security logs
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
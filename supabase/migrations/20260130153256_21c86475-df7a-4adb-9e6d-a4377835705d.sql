-- Remove the overly permissive INSERT policy for newsletter_emails
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_emails;

-- Add a policy that only allows service role to insert (used by edge function)
CREATE POLICY "Only service role can insert newsletter emails" 
ON public.newsletter_emails 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- The existing "Service role can manage subscriptions" policy already allows service role ALL access
-- The existing "Deny public read access to newsletter emails" policy blocks public reads
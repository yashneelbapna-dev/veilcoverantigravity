-- Add explicit policy to deny anonymous access to profiles table
-- This ensures only authenticated users can access profile data
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add explicit policy to deny anonymous access to orders table
-- This ensures only authenticated users can access order data
CREATE POLICY "Deny anonymous access to orders"
ON public.orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);
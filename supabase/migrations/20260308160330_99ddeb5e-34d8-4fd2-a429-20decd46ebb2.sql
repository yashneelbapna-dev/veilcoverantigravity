-- Drop the permissive anonymous INSERT policy
DROP POLICY IF EXISTS "Anyone can claim discount" ON public.discount_coupons;

-- Create a new restrictive INSERT policy for service_role only
CREATE POLICY "Only service role can insert discount coupons"
ON public.discount_coupons
FOR INSERT
TO service_role
WITH CHECK (true);

-- Block anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Block anonymous access to user_addresses table
CREATE POLICY "Block anonymous access to user_addresses"
ON public.user_addresses
FOR ALL
TO anon
USING (false);

-- Block anonymous access to review_votes table
CREATE POLICY "Block anonymous access to review_votes"
ON public.review_votes
FOR ALL
TO anon
USING (false);
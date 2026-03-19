-- Add explicit anonymous blocking policies for defense-in-depth
-- These policies explicitly deny the 'anon' role access to sensitive tables

-- PROFILES TABLE: Block anonymous access explicitly
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- USER_ROLES TABLE: Block anonymous access explicitly
CREATE POLICY "Block anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);

-- CART TABLE: Block anonymous access explicitly
CREATE POLICY "Block anonymous access to cart"
ON public.cart
FOR ALL
TO anon
USING (false);

-- USER_ADDRESSES TABLE: Block anonymous access explicitly
CREATE POLICY "Block anonymous access to user_addresses"
ON public.user_addresses
FOR ALL
TO anon
USING (false);
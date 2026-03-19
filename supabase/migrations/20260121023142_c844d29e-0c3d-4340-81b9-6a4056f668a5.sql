-- Clean up redundant RLS policies that create confusion
-- The individual user-specific policies already properly enforce auth.uid() = user_id

-- PROFILES TABLE: Remove redundant blocking policies
-- The "Users can view/update/insert their own profile" policies already check auth.uid() = user_id
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- USER_ADDRESSES TABLE: Remove redundant blocking policy
-- The existing user-specific policies already check auth.uid() = user_id
DROP POLICY IF EXISTS "Block anonymous access to user_addresses" ON public.user_addresses;

-- CART TABLE: Remove redundant anonymous blocking policy
-- The existing user-specific policies already check auth.uid() = user_id
DROP POLICY IF EXISTS "Block anonymous access to cart" ON public.cart;
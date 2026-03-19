-- Add explicit policies to ensure anonymous users cannot access sensitive tables
-- These policies add defense-in-depth by explicitly requiring authentication

-- ===== PROFILES TABLE =====
-- The existing policies use auth.uid() = user_id, but let's add explicit check
-- Drop and recreate with explicit auth requirement

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Recreate with explicit authentication check using auth.role() check
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ===== ORDERS TABLE =====
-- Add explicit authentication requirement
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

-- Recreate with TO authenticated
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ===== CART TABLE =====
-- Add explicit authentication requirement
DROP POLICY IF EXISTS "Users can view their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can add to their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can update their own cart" ON public.cart;
DROP POLICY IF EXISTS "Users can remove from their own cart" ON public.cart;

-- Recreate with TO authenticated
CREATE POLICY "Users can view their own cart"
ON public.cart
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own cart"
ON public.cart
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.cart
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own cart"
ON public.cart
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ===== WISHLIST TABLE =====
-- Also add explicit auth for wishlist (same pattern)
DROP POLICY IF EXISTS "Users can view their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can add to their own wishlist" ON public.wishlist;
DROP POLICY IF EXISTS "Users can remove from their own wishlist" ON public.wishlist;

CREATE POLICY "Users can view their own wishlist"
ON public.wishlist
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own wishlist"
ON public.wishlist
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
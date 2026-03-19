-- Block anonymous access to profiles table
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Block anonymous access to cart table  
CREATE POLICY "Block anonymous access to cart"
ON public.cart
FOR ALL
USING (auth.uid() IS NOT NULL);
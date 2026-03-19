-- Explicitly deny UPDATE for regular users on orders table
-- This ensures users cannot modify their orders after creation even through potential application logic bugs
CREATE POLICY "Users cannot update their own orders"
ON public.orders
FOR UPDATE
USING (false)
WITH CHECK (false);
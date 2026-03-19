-- Add restrictive policies to make audit_logs append-only (prevent UPDATE and DELETE)
CREATE POLICY "Prevent audit log updates"
ON public.audit_logs
AS RESTRICTIVE
FOR UPDATE
TO authenticated, anon
USING (false);

CREATE POLICY "Prevent audit log deletion"
ON public.audit_logs
AS RESTRICTIVE
FOR DELETE
TO authenticated, anon
USING (false);

-- Add restrictive policy to block anonymous access to wishlist table
CREATE POLICY "Block anonymous access to wishlist"
ON public.wishlist
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);
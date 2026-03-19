
-- The contact_submissions table and its policies were already created.
-- Now create the discount_coupons table and remaining policies.

CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  coupon_code TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'exit_intent',
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can claim discount" ON public.discount_coupons
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view discount coupons" ON public.discount_coupons
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

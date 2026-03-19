
CREATE TABLE public.password_reset_otps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role manages OTPs"
  ON public.password_reset_otps
  FOR ALL
  USING (auth.role() = 'service_role'::text)
  WITH CHECK (auth.role() = 'service_role'::text);

-- Block all public access
CREATE POLICY "Block public access to OTPs"
  ON public.password_reset_otps
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- Index for fast lookup
CREATE INDEX idx_password_reset_otps_email ON public.password_reset_otps (email, used, expires_at);

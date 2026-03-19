
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can update contact submissions (mark as read)
CREATE POLICY "Admins can update contact submissions"
  ON public.contact_submissions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

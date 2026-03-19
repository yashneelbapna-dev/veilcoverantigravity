-- Create newsletter_emails table for storing newsletter subscriptions
CREATE TABLE public.newsletter_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_emails ENABLE ROW LEVEL SECURITY;

-- Allow anyone to subscribe (insert)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_emails 
FOR INSERT 
WITH CHECK (true);

-- Only service role can view/manage subscriptions (for admin use)
CREATE POLICY "Service role can manage subscriptions" 
ON public.newsletter_emails 
FOR ALL 
USING (auth.role() = 'service_role');
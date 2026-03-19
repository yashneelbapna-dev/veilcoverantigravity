-- Create table for newsletter rate limiting (persistent across function restarts)
CREATE TABLE public.newsletter_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  attempt_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique index on IP for fast lookups and upsert
CREATE UNIQUE INDEX idx_newsletter_rate_limits_ip ON public.newsletter_rate_limits(ip_address);

-- Create index for cleanup of old records
CREATE INDEX idx_newsletter_rate_limits_window ON public.newsletter_rate_limits(window_start);

-- Enable RLS
ALTER TABLE public.newsletter_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (used by edge function)
CREATE POLICY "Service role manages rate limits"
ON public.newsletter_rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Block all other access
CREATE POLICY "Block public access to rate limits"
ON public.newsletter_rate_limits
FOR ALL
USING (false);

-- Create function to check and update rate limit atomically
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit(
  check_ip text,
  max_attempts integer DEFAULT 5,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_record RECORD;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Try to get existing record
  SELECT * INTO current_record
  FROM public.newsletter_rate_limits
  WHERE ip_address = check_ip;
  
  IF NOT FOUND THEN
    -- No record exists, create one
    INSERT INTO public.newsletter_rate_limits (ip_address, attempt_count, window_start)
    VALUES (check_ip, 1, now());
    RETURN true; -- Not rate limited
  END IF;
  
  -- Check if window has expired
  IF current_record.window_start < window_start_time THEN
    -- Reset the window
    UPDATE public.newsletter_rate_limits
    SET attempt_count = 1, window_start = now()
    WHERE ip_address = check_ip;
    RETURN true; -- Not rate limited
  END IF;
  
  -- Check if over limit
  IF current_record.attempt_count >= max_attempts THEN
    RETURN false; -- Rate limited
  END IF;
  
  -- Increment counter
  UPDATE public.newsletter_rate_limits
  SET attempt_count = attempt_count + 1
  WHERE ip_address = check_ip;
  
  RETURN true; -- Not rate limited
END;
$$;
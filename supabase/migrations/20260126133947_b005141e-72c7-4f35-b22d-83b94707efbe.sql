-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Create function to purge old search history records
CREATE OR REPLACE FUNCTION public.purge_old_search_history()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.search_history
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the purge action (optional audit trail)
  RAISE LOG 'Purged % old search_history records', deleted_count;
  
  RETURN deleted_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.purge_old_search_history() TO postgres;
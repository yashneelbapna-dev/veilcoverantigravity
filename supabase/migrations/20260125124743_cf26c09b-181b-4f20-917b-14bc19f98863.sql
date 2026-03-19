-- Create audit_logs table for tracking admin operations
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to audit_logs"
ON public.audit_logs
AS RESTRICTIVE
FOR ALL
USING (false);

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = admin_user_id);

-- Add comment for documentation
COMMENT ON TABLE public.audit_logs IS 'Tracks admin operations for security auditing';
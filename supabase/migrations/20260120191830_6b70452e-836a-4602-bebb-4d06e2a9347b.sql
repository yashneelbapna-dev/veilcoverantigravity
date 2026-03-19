-- Add order tracking columns to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery DATE,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- Create order_tracking_history table for detailed tracking events
CREATE TABLE IF NOT EXISTS public.order_tracking_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_tracking_history ENABLE ROW LEVEL SECURITY;

-- Users can view tracking history for their own orders
CREATE POLICY "Users can view their order tracking"
ON public.order_tracking_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_tracking_history.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Admins can manage all tracking history
CREATE POLICY "Admins can manage tracking history"
ON public.order_tracking_history
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Block anonymous access
CREATE POLICY "Block anonymous access to tracking"
ON public.order_tracking_history
FOR ALL
TO anon
USING (false);

-- Create index for faster queries
CREATE INDEX idx_order_tracking_order_id ON public.order_tracking_history(order_id);
CREATE INDEX idx_order_tracking_created_at ON public.order_tracking_history(created_at DESC);
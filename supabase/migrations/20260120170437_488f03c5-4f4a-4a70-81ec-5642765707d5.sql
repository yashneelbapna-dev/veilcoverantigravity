-- Create user_addresses table for address book functionality
CREATE TABLE public.user_addresses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  pincode TEXT NOT NULL,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_addresses
CREATE POLICY "Users can view their own addresses"
ON public.user_addresses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses"
ON public.user_addresses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
ON public.user_addresses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
ON public.user_addresses
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add address_id to orders table for linking saved addresses
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.user_addresses(id);
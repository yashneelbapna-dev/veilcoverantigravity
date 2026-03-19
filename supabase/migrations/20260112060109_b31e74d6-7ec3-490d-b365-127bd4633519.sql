-- Create user roles enum and table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create login_attempts table for rate limiting
CREATE TABLE public.login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  success BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow inserts for tracking (service role manages cleanup)
CREATE POLICY "Anyone can record login attempts"
ON public.login_attempts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role manages login attempts"
ON public.login_attempts
FOR ALL
USING (auth.role() = 'service_role');

-- Function to check rate limit (10 attempts per 12 hours)
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(check_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.login_attempts
    WHERE email = check_email
      AND attempted_at > NOW() - INTERVAL '12 hours'
      AND success = false
  ) < 10
$$;

-- Create products table for inventory
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  images TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  models TEXT[] DEFAULT '{}',
  images_by_color JSONB DEFAULT '{}',
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 100,
  category TEXT,
  collection TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Products are publicly readable
CREATE POLICY "Products are publicly viewable"
ON public.products
FOR SELECT
USING (true);

-- Only admins can manage products
CREATE POLICY "Admins can manage products"
ON public.products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add stock_quantity to orders for tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Create function to auto-assign admin role for specific email
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'yashneelbapna@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign admin on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_assign_admin_role();

-- Enable realtime for orders (for admin dashboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
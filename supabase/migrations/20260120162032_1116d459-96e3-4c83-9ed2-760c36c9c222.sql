-- Fix 1: profiles table - Remove conflicting deny-all policy and update policies with proper auth checks
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;

-- Update SELECT policy to ensure authenticated users only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update UPDATE policy to ensure authenticated users only
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Update INSERT policy to ensure authenticated users only
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Fix 2: login_attempts table - Fix INSERT policy to properly allow service role
DROP POLICY IF EXISTS "Only service role can insert login attempts" ON public.login_attempts;
CREATE POLICY "Only service role can insert login attempts" 
ON public.login_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role'::text);

-- Fix 3: review_votes table - Restrict public SELECT to only user's own votes
DROP POLICY IF EXISTS "Anyone can view review votes" ON public.review_votes;
CREATE POLICY "Users can view their own votes" 
ON public.review_votes 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);
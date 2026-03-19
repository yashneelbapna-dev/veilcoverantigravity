-- Create review_votes table to prevent vote manipulation
CREATE TABLE public.review_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid NOT NULL REFERENCES public.product_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Users can view all votes (for counting)
CREATE POLICY "Anyone can view review votes"
ON public.review_votes
FOR SELECT
USING (true);

-- Users can only insert their own vote
CREATE POLICY "Users can add their own vote"
ON public.review_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own vote
CREATE POLICY "Users can remove their own vote"
ON public.review_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to get helpful count from votes table
CREATE OR REPLACE FUNCTION public.get_review_helpful_count(review_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.review_votes WHERE review_id = review_uuid
$$;

-- Create function to check if user voted
CREATE OR REPLACE FUNCTION public.has_user_voted(review_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.review_votes 
    WHERE review_id = review_uuid AND user_id = user_uuid
  )
$$;
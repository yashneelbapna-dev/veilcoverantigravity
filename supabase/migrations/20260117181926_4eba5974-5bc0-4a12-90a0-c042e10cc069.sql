-- Create product_reviews table for star ratings and photos
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  photos TEXT[] DEFAULT '{}',
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policies for product reviews
CREATE POLICY "Reviews are publicly viewable"
ON public.product_reviews
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.product_reviews
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.product_reviews
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.product_reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_product_reviews_updated_at
BEFORE UPDATE ON public.product_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
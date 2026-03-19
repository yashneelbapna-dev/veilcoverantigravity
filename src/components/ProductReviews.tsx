import { useState, useEffect } from "react";
import { Star, ThumbsUp, Camera, User, Verified } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  content: string | null;
  photos: string[];
  helpful_count: number;
  verified_purchase: boolean;
  created_at: string;
  user_name?: string;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { lightTap, success } = useHapticFeedback();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchReviews();
    if (user) {
      fetchUserVotes();
    }
  }, [productId, user]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("product_reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch vote counts using SECURITY DEFINER function (avoids RLS bypass via COUNT)
      const reviewsWithVotes = await Promise.all(
        (data || []).map(async (review) => {
          const { data: countData } = await supabase
            .rpc("get_review_helpful_count", { review_uuid: review.id });
          
          return {
            ...review,
            helpful_count: countData ?? 0,
          };
        })
      );
      
      setReviews(reviewsWithVotes);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("review_votes")
        .select("review_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setUserVotes(new Set(data?.map((v) => v.review_id) || []));
    } catch (error) {
      console.error("Failed to fetch user votes:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to write a review",
        variant: "destructive",
      });
      return;
    }

    if (newReview.rating < 1) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("product_reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title || null,
        content: newReview.content || null,
        photos: [],
        verified_purchase: false,
      });

      if (error) throw error;

      success();
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setShowForm(false);
      setNewReview({ rating: 5, title: "", content: "" });
      fetchReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to mark reviews as helpful",
        variant: "destructive",
      });
      return;
    }

    lightTap();
    
    const hasVoted = userVotes.has(reviewId);
    
    try {
      if (hasVoted) {
        // Remove vote
        const { error } = await supabase
          .from("review_votes")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id);
        
        if (error) throw error;
        
        setUserVotes((prev) => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      } else {
        // Add vote
        const { error } = await supabase
          .from("review_votes")
          .insert({
            review_id: reviewId,
            user_id: user.id,
          });
        
        if (error) throw error;
        
        setUserVotes((prev) => new Set(prev).add(reviewId));
      }
      
      fetchReviews();
    } catch (error) {
      console.error("Failed to toggle helpful:", error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
  }));

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="h-32 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Reviews</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-semibold text-foreground">
              {averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
            </span>
          </div>
        </div>
        <Button
          onClick={() => {
            lightTap();
            setShowForm(!showForm);
          }}
          className="btn-gradient touch-ripple"
        >
          Write a Review
        </Button>
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="glass-card rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-foreground mb-4">Rating Breakdown</h3>
          {ratingCounts.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-3">
              <span className="w-8 text-sm text-muted-foreground">{stars}★</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{
                    width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-8 text-sm text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div className="glass-card rounded-xl p-6 space-y-4 border border-primary/20">
          <h3 className="font-semibold text-foreground">Write Your Review</h3>

          {/* Star Rating */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Rating
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    lightTap();
                    setNewReview({ ...newReview, rating: i + 1 });
                  }}
                  className="p-1 touch-ripple"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      i < newReview.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground hover:text-amber-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Review Title (optional)
            </label>
            <Input
              value={newReview.title}
              onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
              placeholder="Summarize your review"
              className="bg-background/50"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              Your Review (optional)
            </label>
            <Textarea
              value={newReview.content}
              onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
              placeholder="Tell us about your experience..."
              rows={4}
              className="bg-background/50"
            />
          </div>

          {/* Photo Upload Placeholder */}
          <div className="p-4 border-2 border-dashed border-primary/20 rounded-lg text-center">
            <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Photo upload coming soon
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="flex-1 btn-gradient"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-xl">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No reviews yet</p>
            <p className="text-muted-foreground">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="glass-card rounded-xl p-6 space-y-4 border border-primary/10"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        Customer
                      </span>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-0.5 rounded-full">
                          <Verified className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-semibold text-foreground">{review.title}</h4>
              )}
              {review.content && (
                <p className="text-muted-foreground">{review.content}</p>
              )}

              {/* Photos */}
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="h-20 w-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <button
                onClick={() => handleHelpful(review.id)}
                className={`flex items-center gap-2 text-sm transition-colors touch-ripple ${
                  userVotes.has(review.id)
                    ? "text-primary font-medium"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${userVotes.has(review.id) ? "fill-current" : ""}`} />
                Helpful ({review.helpful_count})
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
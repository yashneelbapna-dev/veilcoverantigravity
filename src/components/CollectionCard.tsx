import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getResponsiveSrc, getSrcSet, COLLECTION_CARD_SIZES } from "@/lib/image";
import { Collection } from "@/data/collections";

interface CollectionCardProps {
  collection: Collection;
  variant?: "default" | "large";
}

const CollectionCard = ({ collection, variant = "default" }: CollectionCardProps) => {
  const isLarge = variant === "large";

  return (
    <Link
      to={`/collections/${collection.slug}`}
      className="group relative block overflow-hidden rounded-xl"
    >
      {/* Background Image */}
      <div className={`relative ${isLarge ? "aspect-[16/9]" : "aspect-[4/5]"}`}>
        <img
          src={getResponsiveSrc(collection.image)}
          srcSet={getSrcSet(collection.image)}
          sizes={COLLECTION_CARD_SIZES}
          alt={collection.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-white/80">
            {collection.productCount} Products
          </p>
          <h3 className={`font-bold text-white ${isLarge ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}>
            {collection.name}
          </h3>
          <p className="text-sm text-white/80 line-clamp-2 max-w-md">
            {collection.tagline}
          </p>
        </div>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-2 text-white transition-transform duration-300 group-hover:translate-x-2">
          <span className="text-sm font-medium">Explore Collection</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
};

export default CollectionCard;
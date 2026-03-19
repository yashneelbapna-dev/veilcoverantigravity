import { useState } from "react";
import { getResponsiveSrc, getSrcSet } from "@/lib/image";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Use the same image repeated if only one is provided
  const displayImages = images.length > 1 ? images : [images[0], images[0], images[0]];

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-2xl bg-card border border-primary/10">
        <img
          src={getResponsiveSrc(displayImages[selectedIndex])}
          srcSet={getSrcSet(displayImages[selectedIndex], [500, 960, 1200])}
          sizes="(max-width: 768px) 100vw, 50vw"
          alt={productName}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {displayImages.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
              selectedIndex === index
                ? "border-primary"
                : "border-primary/10 hover:border-primary/30"
            }`}
          >
            <img
              src={getResponsiveSrc(image, 160)}
              alt={`${productName} ${index + 1}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;

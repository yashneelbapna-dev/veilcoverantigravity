import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  highlight?: string;
  badge?: string;
  urgency?: boolean;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=960&q=80&fm=webp",
    title: "iPhone 16 Pro",
    subtitle: "Matte Black Edition",
    highlight: "Military Grade Protection",
    badge: "NEW",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1610792516307-ea5acd9c3b00?w=960&q=80&fm=webp",
    title: "Samsung S25 Ultra",
    subtitle: "Crystal Clear Series",
    highlight: "Lifetime Anti-Yellowing",
    badge: "BESTSELLER",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=960&q=80&fm=webp",
    title: "Artist Village Workshop",
    subtitle: "Maharashtra Made",
    highlight: "Handcrafted Premium Cases",
    badge: "ARTISAN",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1609692814858-f7cd2f0afa4f?w=960&q=80&fm=webp",
    title: "Google Pixel 9",
    subtitle: "Silicone Grip Edition",
    highlight: "Only 4 Left!",
    badge: "LIMITED",
    urgency: true,
  },
];

// Helper to generate srcset for responsive images
const getSrcSet = (baseUrl: string) => {
  const urlParts = baseUrl.split('?');
  const base = urlParts[0];
  return `${base}?w=480&q=70&fm=webp 480w, ${base}?w=960&q=70&fm=webp 960w, ${base}?w=1200&q=70&fm=webp 1200w`;
};

const HeroSlideshow = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: "start",
    dragFree: false,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    
    onSelect();
    emblaApi.on("select", onSelect);
    
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Defer autoplay to after initial render to reduce TTI
  useEffect(() => {
    if (!emblaApi || isPaused) return;
    
    const timeoutId = setTimeout(() => {
      const interval = setInterval(() => {
        emblaApi.scrollNext();
      }, 3000);
      
      (emblaApi as any).__autoplayInterval = interval;
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if ((emblaApi as any).__autoplayInterval) {
        clearInterval((emblaApi as any).__autoplayInterval);
      }
    };
  }, [emblaApi, isPaused]);

  return (
    <section 
      className="relative overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="relative flex-[0_0_100%] min-w-0 h-[50vh] sm:h-[55vh] md:h-[60vh] lg:h-[70vh]"
            >
              <img
                src={slide.image}
                srcSet={getSrcSet(slide.image)}
                sizes="100vw"
                alt={slide.title}
                width={1200}
                height={800}
                className="absolute inset-0 w-full h-full object-cover object-center"
                fetchPriority={index === 0 ? "high" : "low"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding={index === 0 ? "sync" : "async"}
                style={index === 0 ? { contentVisibility: 'visible' } : undefined}
              />
              
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex items-end sm:items-center pb-16 sm:pb-0">
                <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                  <div className="max-w-md sm:max-w-lg lg:max-w-xl space-y-2 sm:space-y-3 md:space-y-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider",
                        slide.urgency
                          ? "bg-red-600 text-white animate-pulse"
                          : "bg-white/20 text-white backdrop-blur-sm border border-white/20"
                      )}
                    >
                      {slide.badge}
                    </div>

                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                      <span className="block">{slide.title}</span>
                      <span className="block text-white/70 text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">{slide.subtitle}</span>
                    </h1>

                    <p
                      className={cn(
                        "text-xs sm:text-sm md:text-base font-medium",
                        slide.urgency ? "text-red-400" : "text-white/70"
                      )}
                    >
                      {slide.highlight}
                    </p>

                    <div className="flex flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                      <Link
                        to="/tech/phone-cases"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-full bg-white text-black px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm font-semibold transition-all hover:bg-white/90 hover:scale-105 active:scale-95 group"
                      >
                        <span className="hidden xs:inline">SHOP</span> CASES
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <Link
                        to="/collections"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/40 bg-white/10 backdrop-blur-sm px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm font-medium text-white transition-all hover:bg-white/20 active:scale-95"
                      >
                        Collections
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 hidden sm:flex border border-white/10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/30 backdrop-blur-sm text-white transition-all hover:bg-black/50 hidden sm:flex border border-white/10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-0 right-0 flex justify-center items-center gap-2 sm:gap-2.5">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            style={{
              width: index === selectedIndex ? '20px' : '8px',
              height: '8px',
              minWidth: index === selectedIndex ? '20px' : '8px',
              minHeight: '8px',
              maxHeight: '8px',
            }}
            className={cn(
              "transition-all duration-300 rounded-full flex-shrink-0",
              index === selectedIndex
                ? "bg-white"
                : "bg-white/40 hover:bg-white/60"
            )}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-gradient-to-r from-amber-500/80 to-amber-400/80 transition-all duration-300"
          style={{
            width: `${((selectedIndex + 1) / slides.length) * 100}%`,
          }}
        />
      </div>
    </section>
  );
};

export default HeroSlideshow;

export interface Collection {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewCount: number;
  material: string;
  colors: string[];
  phoneModels: string[];
  inStock: boolean;
  collections: string[];
}

export const collections: Collection[] = [
  {
    id: "new-arrivals",
    name: "New Arrivals",
    slug: "new-arrivals",
    tagline: "Fresh Designs, Timeless Protection",
    description: "Discover our latest additions — meticulously crafted phone covers that blend contemporary aesthetics with uncompromising protection. Each piece represents the pinnacle of minimalist design.",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=960&q=80&fm=webp",
    productCount: 12,
    featured: true,
  },
  {
    id: "best-sellers",
    name: "Best Sellers",
    slug: "best-sellers",
    tagline: "Loved by Thousands",
    description: "Our most sought-after designs, chosen by discerning customers worldwide. These iconic pieces have earned their place through exceptional quality and enduring style.",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=960&q=80&fm=webp",
    productCount: 8,
    featured: true,
  },
  {
    id: "minimalist-series",
    name: "Minimalist Series",
    slug: "minimalist-series",
    tagline: "Less is More",
    description: "Pure simplicity meets sophisticated engineering. The Minimalist Series strips away the unnecessary, leaving only what matters — clean lines, premium materials, and flawless protection.",
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=960&q=80&fm=webp",
    productCount: 10,
    featured: true,
  },
  {
    id: "premium-leather",
    name: "Premium Leather",
    slug: "premium-leather",
    tagline: "Luxury You Can Feel",
    description: "Handcrafted from the finest full-grain leather, each case develops a unique patina over time. Experience the warmth and sophistication that only genuine leather can provide.",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=960&q=80&fm=webp",
    productCount: 6,
    featured: true,
  },
];

export const products: Product[] = [
  // New Arrivals
  {
    id: "na-1",
    name: "Midnight Matte iPhone 15 Pro",
    price: 2999,
    originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=960&q=80&fm=webp",
    rating: 4.9,
    reviewCount: 47,
    material: "Matte Polycarbonate",
    colors: ["Black", "Navy", "Forest"],
    phoneModels: ["iPhone 15 Pro", "iPhone 15 Pro Max"],
    inStock: true,
    collections: ["new-arrivals", "minimalist-series"],
  },
  {
    id: "na-2",
    name: "Arctic White Samsung S24",
    price: 2799,
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=960&q=80&fm=webp",
    rating: 4.8,
    reviewCount: 32,
    material: "Premium Silicone",
    colors: ["White", "Cream", "Pearl"],
    phoneModels: ["Samsung S24", "Samsung S24+"],
    inStock: true,
    collections: ["new-arrivals"],
  },
  {
    id: "na-3",
    name: "Graphite Edge iPhone 15",
    price: 2599,
    image: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=960&q=80&fm=webp",
    rating: 4.7,
    reviewCount: 28,
    material: "Aluminum Frame",
    colors: ["Graphite", "Silver", "Gold"],
    phoneModels: ["iPhone 15", "iPhone 15 Plus"],
    inStock: true,
    collections: ["new-arrivals"],
  },
  // Best Sellers
  {
    id: "bs-1",
    name: "Classic Black Leather Pro",
    price: 4499,
    originalPrice: 5499,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=960&q=80&fm=webp",
    rating: 4.9,
    reviewCount: 312,
    material: "Full-Grain Leather",
    colors: ["Black", "Brown", "Tan"],
    phoneModels: ["iPhone 15 Pro", "iPhone 14 Pro"],
    inStock: true,
    collections: ["best-sellers", "premium-leather"],
  },
  {
    id: "bs-2",
    name: "Slate Grey Minimal",
    price: 2999,
    image: "https://images.unsplash.com/photo-1601593346740-925612772716?w=960&q=80&fm=webp",
    rating: 4.8,
    reviewCount: 256,
    material: "Soft-Touch Plastic",
    colors: ["Slate", "Charcoal", "Stone"],
    phoneModels: ["iPhone 15", "iPhone 14"],
    inStock: true,
    collections: ["best-sellers", "minimalist-series"],
  },
  {
    id: "bs-3",
    name: "Rose Gold Elegance",
    price: 3499,
    image: "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=960&q=80&fm=webp",
    rating: 4.9,
    reviewCount: 189,
    material: "Brushed Metal",
    colors: ["Rose Gold", "Gold", "Silver"],
    phoneModels: ["iPhone 15 Pro Max", "iPhone 14 Pro Max"],
    inStock: true,
    collections: ["best-sellers"],
  },
  // Minimalist Series
  {
    id: "ms-1",
    name: "Pure Clear iPhone 15",
    price: 1999,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=960&q=80&fm=webp",
    rating: 4.6,
    reviewCount: 145,
    material: "Crystal Clear TPU",
    colors: ["Clear", "Frosted"],
    phoneModels: ["iPhone 15", "iPhone 15 Plus"],
    inStock: true,
    collections: ["minimalist-series"],
  },
  {
    id: "ms-2",
    name: "Shadow Black Ultra-Thin",
    price: 2299,
    image: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=960&q=80&fm=webp",
    rating: 4.7,
    reviewCount: 98,
    material: "Ultra-Thin PP",
    colors: ["Black", "White"],
    phoneModels: ["Samsung S24", "Samsung S24 Ultra"],
    inStock: true,
    collections: ["minimalist-series"],
  },
  {
    id: "ms-3",
    name: "Fog Grey Matte",
    price: 2499,
    image: "https://images.unsplash.com/photo-1600262300671-295cb21f4d06?w=960&q=80&fm=webp",
    rating: 4.8,
    reviewCount: 76,
    material: "Matte Finish TPU",
    colors: ["Fog Grey", "Mist", "Cloud"],
    phoneModels: ["iPhone 15 Pro", "iPhone 14 Pro"],
    inStock: true,
    collections: ["minimalist-series", "new-arrivals"],
  },
  // Premium Leather
  {
    id: "pl-1",
    name: "Cognac Executive",
    price: 5999,
    originalPrice: 7499,
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=960&q=80&fm=webp",
    rating: 5.0,
    reviewCount: 89,
    material: "Italian Leather",
    colors: ["Cognac", "Burgundy", "Navy"],
    phoneModels: ["iPhone 15 Pro Max", "iPhone 15 Pro"],
    inStock: true,
    collections: ["premium-leather"],
  },
  {
    id: "pl-2",
    name: "Espresso Brown Classic",
    price: 4999,
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=960&q=80&fm=webp",
    rating: 4.9,
    reviewCount: 134,
    material: "Vegetable-Tanned Leather",
    colors: ["Espresso", "Chocolate", "Caramel"],
    phoneModels: ["iPhone 15", "iPhone 14"],
    inStock: true,
    collections: ["premium-leather", "best-sellers"],
  },
  {
    id: "pl-3",
    name: "Midnight Blue Prestige",
    price: 5499,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=960&q=80&fm=webp",
    rating: 4.8,
    reviewCount: 67,
    material: "Nappa Leather",
    colors: ["Midnight Blue", "Deep Ocean", "Ink"],
    phoneModels: ["Samsung S24 Ultra", "Samsung S24+"],
    inStock: true,
    collections: ["premium-leather"],
  },
];

export const getCollectionBySlug = (slug: string): Collection | undefined => {
  return collections.find(c => c.slug === slug);
};

export const getProductsByCollection = (collectionId: string): Product[] => {
  return products.filter(p => p.collections.includes(collectionId));
};
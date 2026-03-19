export interface VeilProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  colors: { name: string; hex: string }[];
  material: string;
  device: string;
  deviceFamily: string;
  collection: string;
  badge?: 'SOLD OUT' | 'LIMITED' | 'NEW' | 'BEST SELLER';
  badgeCount?: number;
  inStock: boolean;
  description: string;
  details: string[];
  magsafe?: boolean;
}

export type DeviceFamily = 'iPhone 17 Series' | 'iPhone 16 Series' | 'iPhone 15 Series' | 'Samsung S25' | 'Pixel 9';

export const deviceFamilies: DeviceFamily[] = [
  'iPhone 17 Series',
  'iPhone 16 Series',
  'iPhone 15 Series',
  'Samsung S25',
  'Pixel 9',
];

export const products: VeilProduct[] = [
  // ═══════ OBSIDIAN SERIES ═══════
  {
    id: 'obs-ip17pro',
    name: 'VEIL Obsidian Pro',
    slug: 'obsidian-pro-iphone-17-pro',
    price: 4499,
    images: [
      '/images/products/obsidian-black-1.webp',
      '/images/products/obsidian-texture.jpg',
      '/images/products/obsidian-slate-1.jpg',
      '/images/products/obsidian-navy-1.jpg',
    ],
    rating: 4.9,
    reviewCount: 312,
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
      { name: 'Slate', hex: '#4a4a4a' },
      { name: 'Deep Navy', hex: '#1a2332' },
    ],
    material: 'Matte',
    device: 'iPhone 17 Pro',
    deviceFamily: 'iPhone 17 Series',
    collection: 'obsidian',
    badge: 'NEW',
    inStock: true,
    magsafe: true,
    description: 'Ultra-minimal matte finish with military-grade drop protection. The Obsidian Pro represents the pinnacle of understated luxury.',
    details: ['Polycarbonate shell + TPU bumper', 'Matte soft-touch coating', 'MagSafe ring embedded', 'Weight: 32g', '6ft drop tested'],
  },
  {
    id: 'obs-ip16pro',
    name: 'VEIL Obsidian Pro',
    slug: 'obsidian-pro-iphone-16-pro',
    price: 3999,
    images: [
      '/images/products/obsidian-black-1.webp',
      '/images/products/obsidian-texture.jpg',
      '/images/products/obsidian-slate-1.jpg',
    ],
    rating: 4.8,
    reviewCount: 456,
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
      { name: 'Slate', hex: '#4a4a4a' },
      { name: 'Deep Navy', hex: '#1a2332' },
    ],
    material: 'Matte',
    device: 'iPhone 16 Pro',
    deviceFamily: 'iPhone 16 Series',
    collection: 'obsidian',
    badge: 'BEST SELLER',
    inStock: true,
    magsafe: true,
    description: 'Our best-selling Obsidian case refined for the iPhone 16 Pro.',
    details: ['Polycarbonate shell + TPU bumper', 'Matte soft-touch coating', 'MagSafe compatible', 'Weight: 31g', '6ft drop tested'],
  },
  {
    id: 'obs-ip15pro',
    name: 'VEIL Obsidian Pro',
    slug: 'obsidian-pro-iphone-15-pro',
    price: 3699,
    images: [
      '/images/products/obsidian-black-1.webp',
      '/images/products/obsidian-texture.jpg',
    ],
    rating: 4.9,
    reviewCount: 678,
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
      { name: 'Slate', hex: '#4a4a4a' },
    ],
    material: 'Matte',
    device: 'iPhone 15 Pro',
    deviceFamily: 'iPhone 15 Series',
    collection: 'obsidian',
    inStock: true,
    magsafe: true,
    description: 'Refined for the iPhone 15 Pro generation. Same iconic matte finish.',
    details: ['Polycarbonate shell + TPU bumper', 'Matte soft-touch coating', 'MagSafe compatible', 'Weight: 30g', '6ft drop tested'],
  },
  {
    id: 'obs-s25ultra',
    name: 'VEIL Obsidian Ultra',
    slug: 'obsidian-ultra-samsung-s25-ultra',
    price: 3999,
    images: [
      '/images/products/obsidian-black-1.webp',
      '/images/products/obsidian-texture.jpg',
    ],
    rating: 4.7,
    reviewCount: 89,
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
    ],
    material: 'Matte',
    device: 'Samsung Galaxy S25 Ultra',
    deviceFamily: 'Samsung S25',
    collection: 'obsidian',
    badge: 'NEW',
    inStock: true,
    description: 'Tailored for the Galaxy S25 Ultra. S-Pen compatible with precision cutouts.',
    details: ['Polycarbonate shell + TPU bumper', 'S-Pen compatible', 'Matte soft-touch coating', 'Weight: 34g', '6ft drop tested'],
  },

  // ═══════ CLEAR SERIES ═══════
  {
    id: 'clr-ip17pro',
    name: 'VEIL Crystal',
    slug: 'crystal-iphone-17-pro',
    price: 3599,
    images: [
      '/images/products/crystal-clear-1.webp',
      '/images/products/crystal-frosted-1.jpg',
    ],
    rating: 4.8,
    reviewCount: 198,
    colors: [
      { name: 'Clear', hex: '#e0e0e0' },
      { name: 'Frosted', hex: '#f0f0f0' },
    ],
    material: 'Clear',
    device: 'iPhone 17 Pro',
    deviceFamily: 'iPhone 17 Series',
    collection: 'clear',
    badge: 'NEW',
    inStock: true,
    magsafe: true,
    description: 'Show off your device with zero-yellowing crystal clear protection.',
    details: ['Anti-yellowing TPU', 'Anti-scratch coating', 'MagSafe ring embedded', 'Weight: 24g', '6ft drop tested'],
  },
  {
    id: 'clr-ip16pro',
    name: 'VEIL Crystal',
    slug: 'crystal-iphone-16-pro',
    price: 2999,
    images: [
      '/images/products/crystal-clear-1.webp',
      '/images/products/crystal-frosted-1.jpg',
    ],
    rating: 4.6,
    reviewCount: 345,
    colors: [
      { name: 'Clear', hex: '#e0e0e0' },
      { name: 'Frosted', hex: '#f0f0f0' },
    ],
    material: 'Clear',
    device: 'iPhone 16 Pro',
    deviceFamily: 'iPhone 16 Series',
    collection: 'clear',
    inStock: true,
    magsafe: true,
    description: 'Premium transparent protection for the iPhone 16 Pro.',
    details: ['Anti-yellowing TPU', 'Anti-scratch coating', 'MagSafe compatible', 'Weight: 23g', '6ft drop tested'],
  },
  {
    id: 'clr-s25',
    name: 'VEIL Crystal Pro Max',
    slug: 'crystal-pro-max-samsung-s25',
    price: 2799,
    images: [
      '/images/products/crystal-clear-1.webp',
      '/images/products/crystal-frosted-1.jpg',
    ],
    rating: 4.7,
    reviewCount: 56,
    colors: [
      { name: 'Clear', hex: '#e0e0e0' },
    ],
    material: 'Clear',
    device: 'Samsung Galaxy S25',
    deviceFamily: 'Samsung S25',
    collection: 'clear',
    inStock: true,
    description: 'Engineered clarity for the Galaxy S25. Enhanced grip texture on sides.',
    details: ['Anti-yellowing TPU', 'Grip texture sides', 'Weight: 22g', '6ft drop tested'],
  },

  // ═══════ LIMITED DROPS ═══════
  {
    id: 'drop-eclipse-17',
    name: 'VEIL x VOID "Eclipse"',
    slug: 'veil-x-void-eclipse-iphone-17-pro',
    price: 6999,
    images: [
      '/images/products/drop-eclipse-1.webp',
      '/images/products/drop-void-1.jpg',
    ],
    rating: 5.0,
    reviewCount: 23,
    colors: [
      { name: 'Black/Gold', hex: '#C9A96E' },
    ],
    material: 'Aramid Fiber',
    device: 'iPhone 17 Pro',
    deviceFamily: 'iPhone 17 Series',
    collection: 'drops',
    badge: 'LIMITED',
    badgeCount: 3,
    inStock: true,
    magsafe: true,
    description: 'The Eclipse edition. Hand-numbered, limited to 50 units worldwide. Black and gold Aramid fiber with VOID\'s signature abstract pattern.',
    details: ['Premium Aramid Fiber', 'Hand-numbered edition', 'Gold foil detailing', 'MagSafe compatible', 'Collector\'s packaging'],
  },
  {
    id: 'drop-eclipse-16',
    name: 'VEIL x VOID "Eclipse"',
    slug: 'veil-x-void-eclipse-iphone-16-pro',
    price: 6499,
    images: [
      '/images/products/drop-eclipse-1.webp',
    ],
    rating: 4.9,
    reviewCount: 67,
    colors: [
      { name: 'Black/Gold', hex: '#C9A96E' },
    ],
    material: 'Aramid Fiber',
    device: 'iPhone 16 Pro',
    deviceFamily: 'iPhone 16 Series',
    collection: 'drops',
    badge: 'SOLD OUT',
    inStock: false,
    description: 'The original Eclipse. Sold out in 4 minutes.',
    details: ['Premium Aramid Fiber', 'Hand-numbered edition', 'Gold foil detailing'],
  },
  {
    id: 'drop-null-16',
    name: 'VEIL x NULL "Obsidian Haze"',
    slug: 'veil-x-null-obsidian-haze-iphone-16',
    price: 5999,
    images: [
      '/images/products/drop-void-1.jpg',
    ],
    rating: 4.8,
    reviewCount: 45,
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a' },
    ],
    material: 'Carbon Fiber',
    device: 'iPhone 16 Pro',
    deviceFamily: 'iPhone 16 Series',
    collection: 'drops',
    badge: 'SOLD OUT',
    inStock: false,
    description: 'NULL\'s vision of digital darkness. Carbon fiber with embossed glyphs.',
    details: ['Carbon Fiber Weave', 'Embossed pattern', 'Collector\'s packaging'],
  },
  {
    id: 'drop-null-s25',
    name: 'VEIL x NULL "Obsidian Haze"',
    slug: 'veil-x-null-obsidian-haze-s25',
    price: 5499,
    images: [
      '/images/products/drop-void-1.jpg',
    ],
    rating: 4.7,
    reviewCount: 31,
    colors: [
      { name: 'Obsidian', hex: '#0a0a0a' },
    ],
    material: 'Carbon Fiber',
    device: 'Samsung Galaxy S25',
    deviceFamily: 'Samsung S25',
    collection: 'drops',
    badge: 'SOLD OUT',
    inStock: false,
    description: 'The Samsung edition. Same darkness, different canvas.',
    details: ['Carbon Fiber Weave', 'Embossed pattern', 'Collector\'s packaging'],
  },
  {
    id: 'leather-ip17pro',
    name: 'VEIL Leather Edition',
    slug: 'leather-edition-iphone-17-pro',
    price: 5499,
    images: [
      '/images/products/leather-brown-1.webp',
      '/images/products/obsidian-black-1.webp',
    ],
    rating: 4.8,
    reviewCount: 112,
    colors: [
      { name: 'Brown', hex: '#8B4513' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Tan', hex: '#D2B48C' },
    ],
    material: 'Leather',
    device: 'iPhone 17 Pro',
    deviceFamily: 'iPhone 17 Series',
    collection: 'obsidian',
    badge: 'NEW',
    inStock: true,
    magsafe: true,
    description: 'Vegetable-tanned Italian leather. Develops a unique patina over time.',
    details: ['Italian vegetable-tanned leather', 'Microfiber lining', 'MagSafe compatible', 'Weight: 38g', 'Develops patina over time'],
  },
];

export const getProductsByDevice = (family: string) =>
  products.filter(p => p.deviceFamily === family);

export const getProductsByCollection = (collection: string) =>
  products.filter(p => p.collection === collection);

export const getProductBySlug = (slug: string) =>
  products.find(p => p.slug === slug);

export const getBestSellers = () =>
  products.filter(p => p.inStock).sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6);

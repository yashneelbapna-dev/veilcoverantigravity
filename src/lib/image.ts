/**
 * Responsive image helpers.
 *
 * – Unsplash URLs: rewrites with `fm=webp`, multiple widths.
 * – Local `/images/…` files: returns the single file (no server-side resize).
 */

export function getResponsiveSrc(src: string, defaultWidth = 960) {
  if (src.includes('unsplash.com')) {
    const base = src.split('?')[0];
    return `${base}?w=${defaultWidth}&q=75&fm=webp`;
  }
  return src;
}

export function getSrcSet(src: string, widths = [300, 500, 960]) {
  if (src.includes('unsplash.com')) {
    const base = src.split('?')[0];
    return widths.map(w => `${base}?w=${w}&q=75&fm=webp ${w}w`).join(', ');
  }
  // Local images — no dynamic resizing available
  return undefined;
}

/** Standard sizes hint for product grid cards */
export const PRODUCT_CARD_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px';

/** Standard sizes hint for collection cards (1/3 grid) */
export const COLLECTION_CARD_SIZES = '(max-width: 768px) 100vw, 33vw';

/** Full-width hero images */
export const HERO_SIZES = '100vw';

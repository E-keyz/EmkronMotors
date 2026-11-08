import { CarListing, FilterParams } from '../types';

/**
 * Format Nigerian Naira to concise abbreviated format:
 * e.g. 38,500,000 -> ₦38.5M, 150,000 -> ₦150K, 2,400,000 -> ₦2.4M
 */
export function formatNaira(amount: number): string {
  if (amount == null || isNaN(amount)) return '₦0';
  
  if (amount >= 1_000_000_000) {
    const val = amount / 1_000_000_000;
    return `₦${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}B`;
  }
  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    return `₦${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    return `₦${val % 1 === 0 ? val.toFixed(0) : val.toFixed(0)}K`;
  }
  return `₦${amount.toLocaleString('en-NG')}`;
}

/**
 * Full Naira formatting with commas
 */
export function formatNairaFull(amount: number): string {
  if (amount == null || isNaN(amount)) return '₦0';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

/**
 * Format mileage with units
 */
export function formatMileage(km: number): string {
  if (km == null || isNaN(km)) return '0 km';
  return `${km.toLocaleString('en-NG')} km`;
}

/**
 * Human friendly "time ago" calculation
 */
export function timeAgo(dateInput: string | Date | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;
    
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) {
    return 'Just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 4) {
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }
  const years = Math.floor(days / 365);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
}

/**
 * Slug generator matching:
 * "nigerian-used-2015-toyota-corolla-s-for-sale-in-ogba-<id>"
 */
export function generateCarSlug(
  condition: string,
  year: number,
  brand: string,
  model: string,
  area: string,
  id: string | number
): string {
  const clean = (str: string) =>
    (str || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const condSlug = clean(condition);
  const brandSlug = clean(brand);
  const modelSlug = clean(model);
  const areaSlug = clean(area);

  return `${condSlug}-${year}-${brandSlug}-${modelSlug}-for-sale-in-${areaSlug}-${id}`.toLowerCase();
}

export const PRESET_PRICE_BUCKETS = [
  { key: 'under-2.4m', label: 'Under ₦2.4M', min: 0, max: 2_400_000 },
  { key: '2.5m-4.9m', label: '₦2.5M - ₦4.9M', min: 2_500_000, max: 4_900_000 },
  { key: '5m-7.5m', label: '₦5M - ₦7.5M', min: 5_000_000, max: 7_500_000 },
  { key: '10m-15m', label: '₦10M - ₦15M', min: 10_000_000, max: 15_000_000 },
  { key: '15m-25m', label: '₦15M - ₦25M', min: 15_000_000, max: 25_000_000 },
  { key: 'above-25m', label: 'Above ₦25M', min: 25_000_000, max: Infinity },
] as const;

/**
 * Filter and sort car listings
 */
export function filterListings(listings: CarListing[], filters: FilterParams): CarListing[] {
  let result = [...listings];

  // Status check: default to active unless specified
  result = result.filter(item => item.status === 'active');

  // Query search
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.brand.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q) ||
      item.area.toLowerCase().includes(q) ||
      item.year.toString().includes(q)
    );
  }

  // Brand filter
  if (filters.brand) {
    const brandLower = filters.brand.toLowerCase().trim();
    result = result.filter(item => item.brand.toLowerCase() === brandLower);
  }

  // Model filter
  if (filters.model) {
    const modelLower = filters.model.toLowerCase().trim();
    result = result.filter(item => item.model.toLowerCase().includes(modelLower));
  }

  // Condition filter
  if (filters.condition) {
    result = result.filter(item => item.condition === filters.condition);
  }

  // Body category filter
  if (filters.category) {
    result = result.filter(item => item.category === filters.category);
  }

  // State filter
  if (filters.state) {
    const stateLower = filters.state.toLowerCase().trim();
    result = result.filter(item => item.state.toLowerCase() === stateLower);
  }

  // Area filter
  if (filters.area) {
    const areaLower = filters.area.toLowerCase().trim();
    result = result.filter(item => item.area.toLowerCase().includes(areaLower));
  }

  // Price range preset bucket
  if (filters.priceRange) {
    const bucket = PRESET_PRICE_BUCKETS.find(b => b.key === filters.priceRange);
    if (bucket) {
      result = result.filter(item => item.price >= bucket.min && item.price <= bucket.max);
    }
  }

  // Custom min price
  if (filters.minPrice != null && !isNaN(filters.minPrice)) {
    result = result.filter(item => item.price >= filters.minPrice!);
  }

  // Custom max price
  if (filters.maxPrice != null && !isNaN(filters.maxPrice)) {
    result = result.filter(item => item.price <= filters.maxPrice!);
  }

  // Sorting
  const sort = filters.sort || 'newest';
  result.sort((a, b) => {
    switch (sort) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'mileage-low':
        return a.mileage - b.mileage;
      case 'year-high':
        return b.year - a.year;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return result;
}

/**
 * WhatsApp click-to-chat link generator
 */
export function generateWhatsAppLink(
  phone: string,
  listingTitle: string,
  price: number,
  listingUrl?: string
): string {
  // Strip non-digits and normalize Nigerian phone number
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '234' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('234')) {
    cleanPhone = '234' + cleanPhone;
  }

  const message = `Hello, I saw your "${listingTitle}" listed for ${formatNaira(price)} on Emkron Motors (Drive with confidence). Is it still available? I would like to schedule an inspection.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

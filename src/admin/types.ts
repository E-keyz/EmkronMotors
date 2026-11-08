export type AdminStatus = 'active' | 'sold' | 'pending';

/** One row of the `listings` table (snake_case, exactly as stored). */
export interface ListingRow {
  id: string;
  slug: string | null;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: 'Foreign Used' | 'Nigerian Used' | 'Brand New';
  category: string;
  state: string;
  area: string | null;
  mileage: number | null;
  mileage_unit: 'km' | 'miles';
  transmission: string;
  fuel_type: string;
  color: string | null;
  vin: string | null;
  description: string | null;
  images: string[];
  features: string[];
  status: AdminStatus | 'rejected';
  views_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const STATUS_LABEL: Record<AdminStatus, string> = {
  active: 'Available',
  sold: 'Sold',
  pending: 'Hidden',
};

export const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

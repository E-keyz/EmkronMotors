import { supabase } from './supabase';
import type { CarListing, SellerProfile } from '../types';
import { BUSINESS_PHONE } from '../config';

const clean = (raw: string | undefined) => (raw || '').trim();

/**
 * Emkron Motors is the only seller, so every listing gets this seller profile.
 * This keeps CarCard / DetailView exactly as designed (they read car.seller.*).
 */
export const BUSINESS_SELLER: SellerProfile = {
  id: 'emkron-motors',
  name: 'Emkron Motors',
  email: '',
  phone: BUSINESS_PHONE,
  whatsapp: BUSINESS_PHONE,
  isVerifiedDealer: true,
  dealershipName: 'Emkron Motors',
  location: clean(import.meta.env.VITE_BUSINESS_LOCATION) || 'Nigeria',
  memberSince: String(new Date().getFullYear()),
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function rowToListing(row: any): CarListing {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    brand: row.brand,
    model: row.model,
    year: row.year,
    price: Number(row.price),
    condition: row.condition,
    category: row.category,
    state: row.state,
    area: row.area ?? '',
    mileage: row.mileage ?? 0,
    mileageUnit: row.mileage_unit ?? 'km',
    transmission: row.transmission,
    fuelType: row.fuel_type,
    color: row.color ?? '',
    vin: row.vin ?? undefined,
    description: row.description ?? '',
    images: row.images ?? [],
    features: row.features ?? [],
    seller: BUSINESS_SELLER,
    status: row.status,
    viewsCount: row.views_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isFeatured: row.is_featured ?? false,
  };
}

export async function fetchListings(): Promise<CarListing[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToListing);
}

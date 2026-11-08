export type CarCondition = 'Foreign Used' | 'Nigerian Used' | 'Brand New';

export type BodyCategory = 
  | 'Sedan' 
  | 'SUV' 
  | 'Crossover' 
  | 'Coupe' 
  | 'Convertible' 
  | 'Hatchback' 
  | 'Wagon' 
  | 'Minivan' 
  | 'Pickup';

export type Transmission = 'Automatic' | 'Manual' | 'CVT';
export type FuelType = 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
export type ListingStatus = 'pending' | 'active' | 'sold' | 'rejected';

export interface StateData {
  id: string;
  name: string;
  slug: string;
  areas: string[];
}

export interface BrandData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  popularModels: string[];
}

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  isVerifiedDealer: boolean;
  dealershipName?: string;
  avatarUrl?: string;
  location: string;
  memberSince: string;
  rating?: number;
}

export interface CarListing {
  id: string;
  slug: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: CarCondition;
  category: BodyCategory;
  state: string;
  area: string;
  mileage: number; // in km
  mileageUnit?: 'km' | 'miles';
  transmission: Transmission;
  fuelType: FuelType;
  color: string;
  vin?: string;
  description: string;
  images: string[];
  features: string[];
  seller: SellerProfile;
  status: ListingStatus;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  isFeatured?: boolean;
}

export interface FilterParams {
  query?: string;
  brand?: string;
  model?: string;
  condition?: CarCondition | '';
  category?: BodyCategory | '';
  state?: string;
  area?: string;
  priceRange?: string; // e.g. "under-2.4m", "2.5m-4.9m", "5m-7.5m", "10m-15m", "15m-25m", "above-25m"
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price-low' | 'price-high' | 'mileage-low' | 'year-high';
  page?: number;
}

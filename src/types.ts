export type CarCondition = 'Foreign Used' | 'Nigerian Used' | 'Brand New';
export type CarStatus = 'available' | 'reserved' | 'sold';

export const CONDITIONS: CarCondition[] = ['Foreign Used', 'Nigerian Used', 'Brand New'];
export const STATUSES: CarStatus[] = ['available', 'reserved', 'sold'];
export const CATEGORIES = ['Sedan', 'SUV', 'Crossover', 'Coupe', 'Convertible', 'Hatchback', 'Wagon', 'Minivan', 'Pickup'];
export const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
export const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

// Field names match the database columns exactly.
export interface Car {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: CarCondition;
  category: string;
  transmission: string;
  fuel_type: string;
  color: string | null;
  mileage: number | null;
  location: string | null;
  description: string | null;
  features: string[];
  images: string[];
  status: CarStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export type CarInput = Omit<Car, 'created_at' | 'updated_at'>;

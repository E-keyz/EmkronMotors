import React from 'react';
import { MapPin, ShieldCheck, Camera, Sparkles } from 'lucide-react';
import { CarListing } from '../types';
import { formatNaira, timeAgo, formatMileage } from '../utils/formatters';

interface CarCardProps {
  car: CarListing;
  onClick: () => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, onClick }) => {
  return (
    <article 
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col group cursor-pointer"
    >
      {/* Photo Container */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        <img
          src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'}
          alt={car.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Condition Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
              car.condition === 'Foreign Used'
                ? 'bg-blue-600 text-white'
                : car.condition === 'Brand New'
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-slate-900'
            }`}
          >
            {car.condition}
          </span>
        </div>

        {/* Featured Tag */}
        {car.isFeatured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
            ★ Featured
          </div>
        )}

        {/* Photo Count Overlay */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
          <Camera className="w-3 h-3" />
          <span>{car.images.length}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          {/* Price & Time Posted */}
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xl font-extrabold text-emerald-700 tracking-tight">
              {formatNaira(car.price)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {timeAgo(car.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition text-sm sm:text-base">
            {car.title}
          </h3>

          {/* Specs Summary Pill */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span className="bg-slate-100 font-semibold px-2 py-0.5 rounded text-slate-700">
              {car.year}
            </span>
            <span>&bull;</span>
            <span>{formatMileage(car.mileage)}</span>
            <span>&bull;</span>
            <span>{car.transmission}</span>
            <span>&bull;</span>
            <span>{car.fuelType}</span>
          </div>
        </div>

        {/* Footer: Location & Verified Dealer Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[65%]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate font-medium">
              {car.area ? `${car.area}, ` : ''}{car.state}
            </span>
          </div>

          {car.seller.isVerifiedDealer && (
            <span 
              className="inline-flex items-center gap-0.5 text-emerald-600 font-bold"
              title="Verified Nigerian Car Dealer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

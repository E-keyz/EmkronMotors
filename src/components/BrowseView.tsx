import React, { useMemo } from 'react';
import { Search, Filter, RotateCcw, ChevronLeft, ChevronRight, Tag, SlidersHorizontal, Sparkles } from 'lucide-react';
import { CarListing, FilterParams, BodyCategory, CarCondition } from '../types';
import { POPULAR_BRANDS, NIGERIAN_STATES, BODY_CATEGORIES } from '../data/seedData';
import { PRESET_PRICE_BUCKETS, formatNaira, filterListings } from '../utils/formatters';
import { CarCard } from './CarCard';

interface BrowseViewProps {
  listings: CarListing[];
  filters: FilterParams;
  onUpdateFilters: (newFilters: Partial<FilterParams>) => void;
  onSelectCar: (car: CarListing) => void;
  seoContext?: {
    type: 'brand' | 'state' | 'category' | 'all';
    label: string;
  };
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  listings,
  filters,
  onUpdateFilters,
  onSelectCar,
  seoContext,
}) => {
  // Apply filtering logic
  const filteredListings = useMemo(() => {
    return filterListings(listings, filters);
  }, [listings, filters]);

  // Compute live price range and stats from ALL currently active listings
  const stats = useMemo(() => {
    const active = listings.filter(l => l.status === 'active');
    if (active.length === 0) return { min: 0, max: 0, total: 0 };
    const prices = active.map(l => l.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      total: active.length,
      filteredTotal: filteredListings.length,
    };
  }, [listings, filteredListings]);

  // Pagination calculations: 20 per page
  const PAGE_SIZE = 20;
  const currentPage = filters.page || 1;
  const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(start, start + PAGE_SIZE);
  }, [filteredListings, currentPage]);

  const hasActiveFilters = Boolean(
    filters.query ||
    filters.brand ||
    filters.condition ||
    filters.category ||
    filters.state ||
    filters.priceRange ||
    filters.minPrice ||
    filters.maxPrice ||
    (filters.sort && filters.sort !== 'newest')
  );

  const resetFilters = () => {
    onUpdateFilters({
      query: '',
      brand: '',
      condition: '',
      category: '',
      state: '',
      priceRange: '',
      minPrice: undefined,
      maxPrice: undefined,
      sort: 'newest',
      page: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Hero Header with Live Computed Stats */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-10 text-white mb-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold mb-3 border border-slate-700 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-extrabold tracking-wide">EMKRON MOTORS</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-red-400 italic font-semibold">Drive with confidence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {seoContext?.label 
              ? `${seoContext.label} for Sale in Nigeria` 
              : 'Verified Cars for Sale in Nigeria'}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            <strong className="text-emerald-400 font-bold">{stats.total} inspected vehicles</strong> ready for purchase across Lagos, Abuja, Port Harcourt & all 36 states.
            Prices range from <strong className="text-white font-bold">{formatNaira(stats.min)}</strong> to <strong className="text-white font-bold">{formatNaira(stats.max)}</strong>.
          </p>

          {/* Search Query Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filters.query || ''}
                onChange={(e) => onUpdateFilters({ query: e.target.value, page: 1 })}
                placeholder="Search make, model, year, or location (e.g. 2019 GLC300 Lekki)..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
            {filters.query && (
              <button
                onClick={() => onUpdateFilters({ query: '', page: 1 })}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      </div>

      {/* Quick Preset Price Buckets Row (Under ₦2.4M, ₦2.5-4.9M, etc.) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Popular Price Ranges in Naira
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onUpdateFilters({ priceRange: '', minPrice: undefined, maxPrice: undefined, page: 1 })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              !filters.priceRange && !filters.minPrice && !filters.maxPrice
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Prices
          </button>

          {PRESET_PRICE_BUCKETS.map((bucket) => {
            const isSelected = filters.priceRange === bucket.key;
            return (
              <button
                key={bucket.key}
                onClick={() => onUpdateFilters({ 
                  priceRange: isSelected ? '' : bucket.key, 
                  minPrice: undefined, 
                  maxPrice: undefined, 
                  page: 1 
                })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {bucket.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Condition */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Condition</label>
            <select
              value={filters.condition || ''}
              onChange={(e) => onUpdateFilters({ condition: e.target.value as CarCondition | '', page: 1 })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Conditions</option>
              <option value="Foreign Used">Foreign Used (Tokunbo)</option>
              <option value="Nigerian Used">Nigerian Used</option>
              <option value="Brand New">Brand New</option>
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Brand / Make</label>
            <select
              value={filters.brand || ''}
              onChange={(e) => onUpdateFilters({ brand: e.target.value, page: 1 })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Brands (~30)</option>
              {POPULAR_BRANDS.map((b) => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">State</label>
            <select
              value={filters.state || ''}
              onChange={(e) => onUpdateFilters({ state: e.target.value, page: 1 })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All 36 States + FCT</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Body Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => onUpdateFilters({ category: e.target.value as BodyCategory | '', page: 1 })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Body Categories</option>
              {BODY_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Sort By</label>
            <select
              value={filters.sort || 'newest'}
              onChange={(e) => onUpdateFilters({ sort: e.target.value as any, page: 1 })}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="newest">Newest Postings</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="mileage-low">Lowest Mileage</option>
              <option value="year-high">Latest Model Year</option>
            </select>
          </div>

          {/* Custom Min/Max Input Popup or Clear button */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Actions</label>
            <button
              onClick={resetFilters}
              disabled={!hasActiveFilters}
              className={`w-full text-xs font-bold rounded-lg p-2 border transition flex items-center justify-center gap-1 cursor-pointer ${
                hasActiveFilters
                  ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Result Count Info */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-slate-700">
          Showing <span className="text-emerald-700 font-extrabold">{paginatedListings.length}</span> of <span className="font-bold">{filteredListings.length}</span> cars
          {hasActiveFilters && ' (filtered)'}
        </p>

        <span className="text-xs text-slate-400 font-medium">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Listings Grid (20 per page) */}
      {paginatedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedListings.map((car) => (
            <CarCard
              key={car.id}
              car={car}
              onClick={() => onSelectCar(car)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-lg mx-auto">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-slate-900">No cars found matching your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            We couldn't find any vehicles matching your current price bucket, condition, or location filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Numbered Pagination (?page=N) */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2">
          <button
            onClick={() => onUpdateFilters({ page: Math.max(1, currentPage - 1) })}
            disabled={currentPage === 1}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => onUpdateFilters({ page: pageNum })}
              className={`w-9 h-9 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                currentPage === pageNum
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onUpdateFilters({ page: Math.min(totalPages, currentPage + 1) })}
            disabled={currentPage === totalPages}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};

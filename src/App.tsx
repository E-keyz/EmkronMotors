import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BrowseView } from './components/BrowseView';
import { DetailView } from './components/DetailView';
import { INITIAL_CAR_LISTINGS, POPULAR_BRANDS, NIGERIAN_STATES, BODY_CATEGORIES } from './data/seedData';
import { CarListing, FilterParams } from './types';
import { BUSINESS_SELLER, fetchListings } from './lib/listings';
import { isSupabaseConfigured } from './lib/supabase';

/** "/" and trailing slashes map to the main listing page. */
const normalizePath = (p: string) => {
  const clean = p.replace(/\/+$/, '') || '/';
  return clean === '/' ? '/cars' : clean;
};

/**
 * Which filters a URL stands for. Returns null for a single-car URL
 * (/cars/<car-slug>) so the browse filters stay as they were.
 */
function filtersForRoute(route: string): Partial<FilterParams> | null {
  const cleared: Partial<FilterParams> = { brand: '', state: '', category: '', page: 1 };
  if (route === '/cars') return { ...cleared, query: '' };

  let m = route.match(/^\/listings\/category\/([^/]+)$/);
  if (m) {
    const cat = BODY_CATEGORIES.find((c) => c.name.toLowerCase() === m![1].toLowerCase());
    return cat ? { ...cleared, category: cat.name } : cleared;
  }
  m = route.match(/^\/cars\/in\/([^/]+)$/);
  if (m) {
    const st = NIGERIAN_STATES.find((x) => x.slug === m![1]);
    return st ? { ...cleared, state: st.name } : cleared;
  }
  m = route.match(/^\/cars\/([^/]+)$/);
  if (m) {
    const brand = POPULAR_BRANDS.find((b) => b.slug === m![1]);
    return brand ? { ...cleared, brand: brand.name } : null;
  }
  return cleared;
}

export default function App() {
  // Live data from Supabase. The demo cars only appear on your own computer (npm run dev) before .env is filled in.
  // On the live site, a missing connection shows a clear message instead of fake cars.
  const showDemo = !isSupabaseConfigured && import.meta.env.DEV;
  const [listings, setListings] = useState<CarListing[]>(() =>
    showDemo ? INITIAL_CAR_LISTINGS.map((l) => ({ ...l, seller: BUSINESS_SELLER })) : []
  );
  const [listingsLoading, setListingsLoading] = useState(isSupabaseConfigured);
  const [listingsError, setListingsError] = useState(
    !isSupabaseConfigured && !import.meta.env.DEV
      ? 'This site is not connected to Supabase (missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in the Cloudflare variables).'
      : ''
  );

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchListings()
      .then(setListings)
      .catch((err) => setListingsError(err.message || 'Could not load cars'))
      .finally(() => setListingsLoading(false));
  }, []);

  // Routing: the address bar is the source of truth, so refresh, back/forward and shared links all work.
  const [currentRoute, setCurrentRoute] = useState<string>(() => normalizePath(window.location.pathname));

  // Filters state
  const [filters, setFilters] = useState<FilterParams>({
    query: '',
    brand: '',
    condition: '',
    category: '',
    state: '',
    priceRange: '',
    sort: 'newest',
    page: 1,
  });

  // Modals state

  // SEO context calculation
  const seoContext = useMemo(() => {
    if (filters.brand) {
      return { type: 'brand' as const, label: `${filters.brand} Cars` };
    }
    if (filters.state) {
      return { type: 'state' as const, label: `Cars in ${filters.state}` };
    }
    if (filters.category) {
      return { type: 'category' as const, label: `${filters.category}s` };
    }
    return undefined;
  }, [filters]);

  // Browser back/forward buttons
  useEffect(() => {
    const onPop = () => setCurrentRoute(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Apply the filters a URL stands for (brand / state / body-type pages)
  useEffect(() => {
    const f = filtersForRoute(currentRoute);
    if (f) setFilters((prev) => ({ ...prev, ...f }));
  }, [currentRoute]);

  const navigateTo = (route: string) => {
    const next = normalizePath(route);
    if (window.location.pathname !== next) window.history.pushState({ app: true }, '', next);
    setCurrentRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCar = (car: CarListing) => navigateTo(`/cars/${car.slug}`);

  // /cars/<car-slug> (anything under /cars/ that isn't a brand page)
  const carSlug = useMemo(() => {
    const m = currentRoute.match(/^\/cars\/([^/]+)$/);
    return m && !POPULAR_BRANDS.some((b) => b.slug === m[1]) ? m[1] : null;
  }, [currentRoute]);

  const selectedCar = useMemo(
    () => (carSlug ? listings.find((l) => l.slug === carSlug || l.id === carSlug) ?? null : null),
    [carSlug, listings]
  );

  // Page title for the browser tab and shared links
  useEffect(() => {
    document.title = selectedCar
      ? `${selectedCar.title} | Emkron Motors`
      : 'Emkron Motors | Drive with confidence';
  }, [selectedCar]);

  // Similar cars for detail view
  const similarCars = useMemo(() => {
    if (!selectedCar) return [];
    return listings
      .filter(l => l.id !== selectedCar.id && l.status === 'active')
      .filter(l => l.brand === selectedCar.brand || l.category === selectedCar.category)
      .slice(0, 4);
  }, [listings, selectedCar]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        totalListingsCount={listings.length}
      />

      {/* Main Body Router */}
      <main className="flex-grow">
        {listingsLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-500 font-medium">Loading cars...</div>
        ) : listingsError ? (
          <div className="max-w-7xl mx-auto px-4 py-24 text-center text-red-600 font-medium">
            Couldn't load cars: {listingsError}
          </div>
        ) : carSlug && !selectedCar ? (
          <div className="max-w-xl mx-auto px-4 py-24 text-center">
            <h1 className="text-2xl font-extrabold text-slate-900">This car is no longer listed</h1>
            <p className="text-slate-500 font-medium mt-2">It may have been sold or removed. See what's available now.</p>
            <button
              onClick={() => navigateTo('/cars')}
              className="mt-6 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              Browse all cars
            </button>
          </div>
        ) : selectedCar ? (
          <DetailView
            car={selectedCar}
            similarCars={similarCars}
            onBack={() => (window.history.state?.app ? window.history.back() : navigateTo('/cars'))}
            onSelectCar={handleSelectCar}
          />
        ) : (
          <BrowseView
            listings={listings}
            filters={filters}
            onUpdateFilters={(newF) => setFilters(prev => ({ ...prev, ...newF }))}
            onSelectCar={handleSelectCar}
            seoContext={seoContext}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs mt-20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h4 className="text-white font-extrabold text-sm mb-4 uppercase tracking-wider">Top Brands</h4>
              <ul className="space-y-2.5 font-medium">
                <li><button onClick={() => navigateTo('/cars/toyota')} className="hover:text-emerald-400 cursor-pointer">Toyota Cars in Nigeria</button></li>
                <li><button onClick={() => navigateTo('/cars/mercedes-benz')} className="hover:text-emerald-400 cursor-pointer">Mercedes-Benz Nigeria</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Lexus RX & ES Series</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Honda Accord & Civic</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Innoson Vehicle Motors (IVM)</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-extrabold text-sm mb-4 uppercase tracking-wider">Top Locations</h4>
              <ul className="space-y-2.5 font-medium">
                <li><button onClick={() => navigateTo('/cars/in/lagos')} className="hover:text-emerald-400 cursor-pointer">Cars for sale in Lagos (Ikeja, Lekki)</button></li>
                <li><button onClick={() => navigateTo('/cars/in/abuja')} className="hover:text-emerald-400 cursor-pointer">Cars for sale in Abuja (Maitama, Wuse)</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Port Harcourt (Rivers State)</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Ibadan (Oyo State)</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Kano State Auto Market</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-extrabold text-sm mb-4 uppercase tracking-wider">Body Types</h4>
              <ul className="space-y-2.5 font-medium">
                <li><button onClick={() => navigateTo('/listings/category/suv')} className="hover:text-emerald-400 cursor-pointer">SUVs & Crossovers</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Sedans & Saloons</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Hilux & Double Cab Pickups</button></li>
                <li><button onClick={() => navigateTo('/cars')} className="hover:text-emerald-400 cursor-pointer">Family Minivans & Buses</button></li>
              </ul>
            </div>

            <div>
              <div className="mb-4 inline-block bg-white rounded-xl px-3 py-2">
                <img
                  src="/assets/emkron-logo.png"
                  alt="Emkron Motors"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-slate-400 leading-relaxed mb-4">
                <strong className="text-white">Emkron Motors</strong> &bull; <span className="text-red-400 italic">Drive with confidence</span>. Nigeria's premier vehicle exchange with verified pricing, customs documentation, and direct seller WhatsApp access.
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>&copy; 2025 Emkron Motors &bull; Drive with confidence. All rights reserved.</p>
            <div className="flex gap-4">
              <button onClick={() => navigateTo('/cars')} className="hover:text-slate-300">Terms of Use</button>
              <span>&bull;</span>
              <button onClick={() => navigateTo('/cars')} className="hover:text-slate-300">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { BrowseView } from './components/BrowseView';
import { DetailView } from './components/DetailView';
import { INITIAL_CAR_LISTINGS, POPULAR_BRANDS, NIGERIAN_STATES, BODY_CATEGORIES } from './data/seedData';
import { CarListing, FilterParams } from './types';
import { BUSINESS_SELLER, fetchListings } from './lib/listings';
import { isSupabaseConfigured } from './lib/supabase';

export default function App() {
  // Live data from Supabase. Until .env is filled in, the demo seed data is shown instead.
  const [listings, setListings] = useState<CarListing[]>(() =>
    isSupabaseConfigured ? [] : INITIAL_CAR_LISTINGS.map((l) => ({ ...l, seller: BUSINESS_SELLER }))
  );
  const [listingsLoading, setListingsLoading] = useState(isSupabaseConfigured);
  const [listingsError, setListingsError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchListings()
      .then(setListings)
      .catch((err) => setListingsError(err.message || 'Could not load cars'))
      .finally(() => setListingsLoading(false));
  }, []);

  // Routing state
  const [currentRoute, setCurrentRoute] = useState<string>('/cars');
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null);

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

  // Handle URL sync on mount and state changes
  useEffect(() => {
    // If route matches /cars/in/:state or /cars/:brand
    const path = window.location.pathname;
    if (path.startsWith('/cars/in/')) {
      const stateSlug = path.replace('/cars/in/', '').replace(/\/$/, '');
      const stateObj = NIGERIAN_STATES.find(s => s.slug === stateSlug);
      if (stateObj) {
        setFilters(f => ({ ...f, state: stateObj.name }));
        setCurrentRoute(path);
      }
    } else if (path.startsWith('/listings/category/')) {
      const catSlug = path.replace('/listings/category/', '').replace(/\/$/, '');
      const catObj = BODY_CATEGORIES.find(c => c.name.toLowerCase() === catSlug.toLowerCase());
      if (catObj) {
        setFilters(f => ({ ...f, category: catObj.name }));
        setCurrentRoute(path);
      }
    } else if (path.startsWith('/cars/') && path !== '/cars' && path !== '/cars/') {
      const brandSlug = path.replace('/cars/', '').replace(/\/$/, '');
      const brandObj = POPULAR_BRANDS.find(b => b.slug === brandSlug);
      if (brandObj) {
        setFilters(f => ({ ...f, brand: brandObj.name }));
        setCurrentRoute(path);
      }
    }
  }, []);

  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    setSelectedCar(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update filters according to preset SEO route
    if (route === '/cars') {
      setFilters(f => ({ ...f, brand: '', state: '', category: '', query: '', page: 1 }));
    } else if (route === '/cars/in/lagos') {
      setFilters(f => ({ ...f, state: 'Lagos', brand: '', category: '', page: 1 }));
    } else if (route === '/cars/in/abuja') {
      setFilters(f => ({ ...f, state: 'Abuja (FCT)', brand: '', category: '', page: 1 }));
    } else if (route === '/cars/toyota') {
      setFilters(f => ({ ...f, brand: 'Toyota', state: '', category: '', page: 1 }));
    } else if (route === '/cars/mercedes-benz') {
      setFilters(f => ({ ...f, brand: 'Mercedes-Benz', state: '', category: '', page: 1 }));
    } else if (route === '/listings/category/suv') {
      setFilters(f => ({ ...f, category: 'SUV', state: '', brand: '', page: 1 }));
    }
  };

  const handleSelectCar = (car: CarListing) => {
    setSelectedCar(car);
    setCurrentRoute(`/cars/${car.slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        ) : selectedCar ? (
          <DetailView
            car={selectedCar}
            similarCars={similarCars}
            onBack={() => {
              setSelectedCar(null);
              setCurrentRoute('/cars');
            }}
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

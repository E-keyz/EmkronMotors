import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Car } from '../types';
import { CONDITIONS, CATEGORIES } from '../types';
import { CarCard } from '../components/CarCard';
import { BUSINESS_NAME, TAGLINE, SELL_MESSAGE, whatsappLink } from '../config';

const PRICE_BUCKETS = [
  { key: '', label: 'Any price', min: 0, max: Infinity },
  { key: 'u3', label: 'Under ₦3M', min: 0, max: 3_000_000 },
  { key: '3-6', label: '₦3M - ₦6M', min: 3_000_000, max: 6_000_000 },
  { key: '6-10', label: '₦6M - ₦10M', min: 6_000_000, max: 10_000_000 },
  { key: '10-20', label: '₦10M - ₦20M', min: 10_000_000, max: 20_000_000 },
  { key: '20+', label: 'Above ₦20M', min: 20_000_000, max: Infinity },
];

const selectCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium';

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [hideSold, setHideSold] = useState(true);

  useEffect(() => {
    document.title = `${BUSINESS_NAME} | ${TAGLINE}`;
    supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setCars((data as Car[]) || []);
        setLoading(false);
      });
  }, []);

  const brands = useMemo(() => Array.from(new Set(cars.map((c) => c.brand))).sort(), [cars]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bucket = PRICE_BUCKETS.find((b) => b.key === price)!;
    const list = cars.filter((c) => {
      if (hideSold && c.status === 'sold') return false;
      if (q && !`${c.title} ${c.brand} ${c.model} ${c.year} ${c.location ?? ''}`.toLowerCase().includes(q)) return false;
      if (brand && c.brand !== brand) return false;
      if (condition && c.condition !== condition) return false;
      if (category && c.category !== category) return false;
      if (c.price < bucket.min || c.price > bucket.max) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'year') return b.year - a.year;
      return +new Date(b.created_at) - +new Date(a.created_at);
    });
    return list;
  }, [cars, query, brand, condition, category, price, sort, hideSold]);

  const reset = () => {
    setQuery(''); setBrand(''); setCondition(''); setCategory(''); setPrice(''); setSort('newest');
  };

  return (
    <div>
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-2xl">{TAGLINE}.</h1>
          <p className="mt-3 text-slate-300 max-w-xl">
            Inspected Foreign Used, Nigerian Used and Brand New cars. See something you like? Message us on WhatsApp.
          </p>
          <div className="mt-6 relative max-w-xl">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search make, model, year or location"
              className="w-full rounded-xl pl-11 pr-4 py-3.5 text-slate-900 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-2 lg:grid-cols-6 gap-3">
          <select className={selectCls} value={brand} onChange={(e) => setBrand(e.target.value)} aria-label="Brand">
            <option value="">All brands</option>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select className={selectCls} value={condition} onChange={(e) => setCondition(e.target.value)} aria-label="Condition">
            <option value="">Any condition</option>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Body type">
            <option value="">Any body type</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className={selectCls} value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price">
            {PRICE_BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
          </select>
          <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="newest">Newest first</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
            <option value="year">Year: newest</option>
          </select>
          <button onClick={reset} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50">
            Reset
          </button>
        </div>

        <div className="flex items-center justify-between mt-5 mb-4 text-sm">
          <p className="font-semibold">{filtered.length} {filtered.length === 1 ? 'car' : 'cars'}</p>
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} />
            Hide sold cars
          </label>
        </div>

        {error && <p className="rounded-lg bg-red-50 text-red-700 p-4 text-sm">Couldn't load cars: {error}</p>}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 && !error ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <p className="font-bold text-lg">No cars match these filters</p>
            <p className="text-slate-500 text-sm mt-1">Try clearing a filter, or tell us what you're looking for.</p>
            <a
              href={whatsappLink(`Hello ${BUSINESS_NAME}, I'm looking for a car. Can you help me find one?`)}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm"
            >
              <MessageCircle className="w-4 h-4" /> Ask us on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => <CarCard key={c.id} car={c} />)}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-black text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">Want to sell your car?</h2>
            <p className="text-slate-300 text-sm mt-1">Send us the details on WhatsApp and we'll get back to you.</p>
          </div>
          <a
            href={whatsappLink(SELL_MESSAGE)} target="_blank" rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-sm"
          >
            <MessageCircle className="w-4 h-4" /> Sell your car on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}

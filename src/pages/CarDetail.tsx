import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, MessageCircle, Share2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Car } from '../types';
import { formatMileage, formatNairaFull } from '../lib/format';
import { BUSINESS_NAME, whatsappLink } from '../config';

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        setCar(data as Car | null);
        setLoading(false);
        if (data) document.title = `${(data as Car).title} | ${BUSINESS_NAME}`;
      });
  }, [id]);

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-10"><div className="h-96 rounded-2xl bg-slate-200 animate-pulse" /></div>;

  if (!car)
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Car not found</h1>
        <p className="text-slate-500 mt-2">It may have been removed.</p>
        <Link to="/" className="inline-block mt-6 font-bold text-red-600">Back to all cars</Link>
      </div>
    );

  const sold = car.status === 'sold';
  const pageUrl = window.location.href;
  const enquiry = whatsappLink(
    `Hello ${BUSINESS_NAME}, I'm interested in the ${car.title} listed at ${formatNairaFull(car.price)}. Is it still available?\n${pageUrl}`
  );

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: car.title, url: pageUrl }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const specs: [string, string][] = [
    ['Year', String(car.year)],
    ['Condition', car.condition],
    ['Mileage', formatMileage(car.mileage)],
    ['Transmission', car.transmission],
    ['Fuel', car.fuel_type],
    ['Body type', car.category],
    ['Colour', car.color || 'N/A'],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-red-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> All cars
      </Link>

      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-200">
            {car.images[active] ? (
              <img src={car.images[active]} alt={car.title} className={`w-full h-full object-cover ${sold ? 'grayscale' : ''}`} />
            ) : (
              <div className="w-full h-full grid place-items-center text-slate-400">No photo yet</div>
            )}
            {sold && <span className="absolute top-4 left-4 bg-black text-white font-bold px-3 py-1 rounded-full text-sm">Sold</span>}
          </div>
          {car.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {car.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`shrink-0 w-24 aspect-[16/10] rounded-lg overflow-hidden border-2 ${i === active ? 'border-red-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {car.description && (
            <div className="mt-8">
              <h2 className="font-extrabold text-lg mb-2">About this car</h2>
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{car.description}</p>
            </div>
          )}

          {car.features.length > 0 && (
            <div className="mt-8">
              <h2 className="font-extrabold text-lg mb-3">Features</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {car.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-red-600 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 lg:sticky lg:top-24">
            <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">{car.title}</h1>
            <p className="text-3xl font-extrabold text-red-600 mt-2">{formatNairaFull(car.price)}</p>
            {car.location && (
              <p className="flex items-center gap-1 text-sm text-slate-500 mt-2"><MapPin className="w-4 h-4" /> {car.location}</p>
            )}

            {sold ? (
              <p className="mt-5 rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-700">This car has been sold. Message us and we'll help you find something similar.</p>
            ) : null}

            <a
              href={enquiry} target="_blank" rel="noreferrer"
              className="mt-5 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              <MessageCircle className="w-5 h-5" /> {sold ? 'Ask for similar cars' : 'Chat on WhatsApp'}
            </a>
            <button
              onClick={share}
              className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-300 font-semibold text-sm hover:bg-slate-50"
            >
              <Share2 className="w-4 h-4" /> {copied ? 'Link copied' : 'Share this car'}
            </button>

            <dl className="mt-6 divide-y divide-slate-100 text-sm">
              {specs.map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-semibold text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

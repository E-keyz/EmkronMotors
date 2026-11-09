import React, { useState } from 'react';
import { 
  MapPin, ShieldCheck, Phone, MessageSquare, ChevronLeft, 
  CheckCircle, Calendar, Gauge, Fuel, Cog, Palette, Hash, Share2, Eye
} from 'lucide-react';
import { CarListing } from '../types';
import { formatNaira, formatNairaFull, timeAgo, formatMileage, generateWhatsAppLink } from '../utils/formatters';

interface DetailViewProps {
  car: CarListing;
  similarCars: CarListing[];
  onBack: () => void;
  onSelectCar: (car: CarListing) => void;
}

export const DetailView: React.FC<DetailViewProps> = ({
  car,
  similarCars,
  onBack,
  onSelectCar,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const images = car.images && car.images.length > 0
    ? car.images
    : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'];

  const whatsappUrl = generateWhatsAppLink(
    car.seller.whatsapp,
    car.title,
    car.price,
    window.location.href
  );

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Action & Breadcrumb Nav */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Listings</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copied!' : 'Share Listing'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Gallery, Specs, Description, Similar Cars */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Active Image Surface */}
            <div className="aspect-[16/10] bg-slate-900 relative overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={`${car.title} photo ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Condition Tag Overlay */}
              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
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

              {car.isFeatured && (
                <div className="absolute top-4 right-4 bg-amber-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-md">
                  ★ Verified Listing
                </div>
              )}
            </div>

            {/* Thumbnail Carousel Bar */}
            {images.length > 1 && (
              <div className="p-4 flex gap-3 overflow-x-auto bg-slate-50 border-t border-slate-100">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-600/30'
                        : 'border-transparent hover:border-slate-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Price Block */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {car.brand} &bull; {car.category} &bull; {car.year}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {car.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {car.area ? `${car.area}, ` : ''}{car.state}
                  </span>
                  <span>&bull;</span>
                  <span>Posted {timeAgo(car.createdAt)}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {car.viewsCount} views
                  </span>
                </div>
              </div>

              <div className="sm:text-right flex-shrink-0">
                <div className="text-xs text-slate-400 font-bold uppercase">Asking Price</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">
                  {formatNaira(car.price)}
                </div>
                <div className="text-xs text-slate-500 font-bold mt-0.5">
                  {formatNairaFull(car.price)}
                </div>
              </div>
            </div>

            {/* Full Specifications Grid */}
            <div className="mt-8">
              <h2 className="text-base font-bold text-slate-900 mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Year</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{car.year}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Mileage</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{formatMileage(car.mileage)}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Condition</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{car.condition}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Cog className="w-3.5 h-3.5" />
                    <span>Transmission</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{car.transmission}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Fuel Type</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{car.fuelType}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>Colour</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">{car.color}</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 truncate block">
                    {car.area ? `${car.area}, ` : ''}{car.state}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-1">
                    <Hash className="w-3.5 h-3.5" />
                    <span>VIN / Chassis</span>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-slate-900 truncate block">
                    {car.vin || 'Customs Verified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 mb-3">Seller's Description & Notes</h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                {car.description}
              </div>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900 mb-3">Key Features & Installed Options</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Similar Cars Section */}
          {similarCars.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Similar Cars You Might Like</h2>
                <span className="text-xs text-slate-400 font-semibold">Matched by make and category</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarCars.map((sim) => (
                  <div
                    key={sim.id}
                    onClick={() => onSelectCar(sim)}
                    className="bg-white rounded-2xl border border-slate-200 p-3 flex gap-4 hover:shadow-md transition cursor-pointer"
                  >
                    <img
                      src={sim.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80'}
                      alt={sim.title}
                      className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex flex-col justify-between truncate">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 truncate">{sim.title}</h4>
                        <span className="text-xs text-slate-500 font-medium">{sim.year} &bull; {sim.state}</span>
                      </div>
                      <div className="font-extrabold text-emerald-700 text-sm">
                        {formatNaira(sim.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Seller Card & Contact CTAs */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md sticky top-24">
            
            {/* Seller Identity */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                  {car.seller.dealershipName || car.seller.name}
                </h3>
                {car.seller.isVerifiedDealer && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified Dealer</span>
                  </span>
                )}
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Member since {car.seller.memberSince} &bull; {car.seller.location}
                </p>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="mt-6 space-y-3">
              {/* WhatsApp Click to Chat (wa.me link with prefilled inquiry) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Chat on WhatsApp</span>
              </a>

              {/* Direct Call Button */}
              <a
                href={`tel:${car.seller.phone}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call {car.seller.phone}</span>
              </a>
            </div>

            {/* Emkron Motors Confidence Guarantee */}
            <div className="mt-6 p-4 rounded-2xl bg-slate-950 text-white border border-slate-800 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider text-red-500 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>EMKRON MOTORS</span>
                </span>
                <span className="text-[10px] text-slate-400 italic">Drive with confidence</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Every vehicle on Emkron undergoes verification for genuine customs duty, clean chassis numbers, and authentic dealer ownership.
              </p>
            </div>

            {/* Safety Guidelines for Nigeria */}
            <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <span>🛡️</span> Nigerian Buyer Safety Checklist
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 text-[11px]">
                <li>Never send money or commitment fee before physical car inspection.</li>
                <li>Meet the seller in a safe, public daylight location (e.g. busy petrol station, bank branch, dealer car park).</li>
                <li>Check engine number, chassis number, and customs duty paper validity.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

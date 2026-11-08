import React, { useState, useId } from 'react';
import { Camera, Upload, Trash2, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { POPULAR_BRANDS, NIGERIAN_STATES, BODY_CATEGORIES } from '../data/seedData';
import { CarListing, CarCondition, BodyCategory, Transmission, FuelType } from '../types';
import { generateCarSlug } from '../utils/formatters';

interface SellViewProps {
  onListingCreated: (newListing: CarListing) => void;
  onCancel: () => void;
  currentUser: { name: string; phone: string; isDealer: boolean } | null;
}

export const SellView: React.FC<SellViewProps> = ({
  onListingCreated,
  onCancel,
  currentUser
}) => {
  const [selectedBrand, setSelectedBrand] = useState('Toyota');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(2018);
  const [condition, setCondition] = useState<CarCondition>('Foreign Used');
  const [category, setCategory] = useState<BodyCategory>('SUV');
  const [price, setPrice] = useState<string>('18500000');
  const [mileage, setMileage] = useState<string>('54000');
  const [transmission, setTransmission] = useState<Transmission>('Automatic');
  const [fuelType, setFuelType] = useState<FuelType>('Petrol');
  const [color, setColor] = useState('White');
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState(
    'Exceptionally clean Tokunbo. Chilling factory fitted AC, sharp automatic gear, sound engine, pristine interior, all customs documents 100% verified.'
  );

  // Cascading Location (State -> Area)
  const [selectedStateName, setSelectedStateName] = useState('Lagos');
  const currentStateObj = NIGERIAN_STATES.find(s => s.name === selectedStateName) || NIGERIAN_STATES[0];
  const [selectedArea, setSelectedArea] = useState(currentStateObj.areas[0] || 'Ikeja');

  // Seller Details
  const [sellerName, setSellerName] = useState(currentUser?.name || 'Lekki Auto Gallery');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '08035544321');
  const [sellerWhatsapp, setSellerWhatsapp] = useState(currentUser?.phone || '08035544321');

  // Images with client compression preview
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80'
  ]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Handle client-side image upload & compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const newImgs: string[] = [];

    Array.from(files).slice(0, 8).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // Client-side canvas compression to max 1200px width/height and 0.8 JPEG quality
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            newImgs.push(compressed);
            if (newImgs.length === Math.min(files.length, 8)) {
              setImages(prev => [...prev, ...newImgs].slice(0, 10));
              setIsCompressing(false);
            }
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const numericPrice = parseFloat(price.replace(/[^0-9.]/g, '')) || 5000000;
    const numericMileage = parseInt(mileage.replace(/[^0-9]/g, ''), 10) || 50000;
    const resolvedModel = model.trim() || 'Cruiser';
    const title = `${condition} ${year} ${selectedBrand} ${resolvedModel}`;
    const id = Date.now().toString().slice(-6);

    const slug = generateCarSlug(
      condition,
      year,
      selectedBrand,
      resolvedModel,
      selectedArea,
      id
    );

    const newListing: CarListing = {
      id,
      slug,
      title,
      brand: selectedBrand,
      model: resolvedModel,
      year,
      price: numericPrice,
      condition,
      category,
      state: selectedStateName,
      area: selectedArea,
      mileage: numericMileage,
      transmission,
      fuelType,
      color,
      vin: vin.trim() || undefined,
      description,
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1200&auto=format&fit=crop&q=80'],
      features: ['Air Conditioning', 'Leather Seats', 'Alloy Wheels', 'Power Steering', 'Keyless Entry'],
      seller: {
        id: `seller-${id}`,
        name: sellerName,
        dealershipName: sellerName,
        email: 'seller@carspace.ng',
        phone: sellerPhone,
        whatsapp: sellerWhatsapp,
        isVerifiedDealer: currentUser?.isDealer || false,
        avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        location: `${selectedArea}, ${selectedStateName}`,
        memberSince: 'Just now',
        rating: 5.0
      },
      status: 'active',
      viewsCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFeatured: false,
    };

    onListingCreated(newListing);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Post Your Car for Sale</h1>
        <p className="text-slate-500 text-sm mt-1">
          Reach active Nigerian car buyers with direct WhatsApp chats and calls. Free ad posting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Photos Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">1. Vehicle Photos (Max 10)</h2>
            <span className="text-xs text-slate-400 font-bold">{images.length}/10 uploaded</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Upload clear photos of front, rear, sides, dashboard, seats and engine bay. Photos are compressed client-side before storage upload.
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 block group">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-slate-800">
              {isCompressing ? 'Compressing photos...' : 'Click or drag photos here'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Supports JPEG, PNG, WebP (automatic client-side compression to &lt; 300KB)
            </div>
          </label>

          {/* Uploaded Preview Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Vehicle Specs */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">2. Vehicle Specifications</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Brand */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Brand / Make *</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {POPULAR_BRANDS.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. GLC300, Corolla, RX350, Prado..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition *</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as CarCondition)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="Foreign Used">Foreign Used (Tokunbo)</option>
                <option value="Nigerian Used">Nigerian Used</option>
                <option value="Brand New">Brand New</option>
              </select>
            </div>

            {/* Body Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Body Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BodyCategory)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {BODY_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Year of Manufacture *</label>
              <input
                type="number"
                min="1995"
                max="2026"
                required
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10) || 2018)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Asking Price in Naira (₦) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 38500000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-800"
              />
            </div>

            {/* Mileage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Mileage (km)</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g. 52000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value as Transmission)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="Automatic">Automatic</option>
                <option value="Manual">Manual</option>
                <option value="CVT">CVT</option>
              </select>
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            {/* Colour */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Colour</label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Polar White, Grey, Black..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              />
            </div>

            {/* VIN (Optional) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">VIN / Chassis Number (Optional)</label>
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                placeholder="17-digit chassis number for vehicle history verification..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Description & Fault Report</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe condition of AC, tires, paint, customs duty papers, engine status..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* 3. Location Cascades (State -> Area) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">3. Location Picker (State & Area)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State *</label>
              <select
                value={selectedStateName}
                onChange={(e) => {
                  const newState = e.target.value;
                  setSelectedStateName(newState);
                  const st = NIGERIAN_STATES.find(s => s.name === newState);
                  setSelectedArea(st?.areas[0] || 'Central Area');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {NIGERIAN_STATES.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Area / Neighborhood *</label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {currentStateObj.areas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Seller Contact */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">4. Seller Contact Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Seller or Dealership Name *</label>
              <input
                type="text"
                required
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="e.g. Coscharis Pre-Owned / Emeka Autos"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number (Calling) *</label>
              <input
                type="tel"
                required
                value={sellerPhone}
                onChange={(e) => setSellerPhone(e.target.value)}
                placeholder="08031234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Number *</label>
              <input
                type="tel"
                required
                value={sellerWhatsapp}
                onChange={(e) => setSellerWhatsapp(e.target.value)}
                placeholder="08031234567"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Submit Controls */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-2xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
          >
            <span>Publish Car Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};

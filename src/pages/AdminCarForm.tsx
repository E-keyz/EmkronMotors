import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteCarImages, uploadCarImage } from '../lib/images';
import { formatNairaFull } from '../lib/format';
import type { Car, CarCondition, CarStatus } from '../types';
import { CATEGORIES, CONDITIONS, FUEL_TYPES, STATUSES, TRANSMISSIONS } from '../types';

const input = 'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal';
const label = 'block text-sm font-semibold';

export default function AdminCarForm() {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(editId);

  // For a new car we create the id up front so photos can be stored under it.
  const carId = useRef(editId || crypto.randomUUID()).current;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState('');

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear() - 5));
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<CarCondition>('Foreign Used');
  const [category, setCategory] = useState('Sedan');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuel, setFuel] = useState('Petrol');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [status, setStatus] = useState<CarStatus>('available');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [originalImages, setOriginalImages] = useState<string[]>([]);

  useEffect(() => {
    if (!editId) return;
    supabase.from('cars').select('*').eq('id', editId).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setError(error?.message || 'Car not found'); setLoading(false); return; }
      const c = data as Car;
      setBrand(c.brand); setModel(c.model); setYear(String(c.year)); setTitle(c.title);
      setPrice(String(c.price)); setCondition(c.condition); setCategory(c.category);
      setTransmission(c.transmission); setFuel(c.fuel_type); setColor(c.color || '');
      setMileage(c.mileage != null ? String(c.mileage) : ''); setLocation(c.location || '');
      setDescription(c.description || ''); setFeatures(c.features.join(', '));
      setStatus(c.status); setFeatured(c.is_featured); setImages(c.images); setOriginalImages(c.images);
      setLoading(false);
    });
  }, [editId]);

  const onFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError('');
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadCarImage(carId, file);
        setImages((prev) => [...prev, url]);
      } catch (e) {
        setError(`Couldn't upload ${file.name}: ${(e as Error).message}`);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const move = (i: number, dir: -1 | 1) =>
    setImages((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const makeCover = (i: number) => setImages((prev) => [prev[i], ...prev.filter((_, k) => k !== i)]);
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, k) => k !== i));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (uploading > 0) { setError('Wait for photos to finish uploading.'); return; }
    if (!images.length) { setError('Add at least one photo.'); return; }

    setSaving(true);
    const payload = {
      id: carId,
      title: title.trim() || `${year} ${brand.trim()} ${model.trim()}`,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      price: Number(price),
      condition,
      category,
      transmission,
      fuel_type: fuel,
      color: color.trim() || null,
      mileage: mileage ? Number(mileage) : null,
      location: location.trim() || null,
      description: description.trim() || null,
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
      images,
      status,
      is_featured: featured,
    };

    const { error } = await supabase.from('cars').upsert(payload);
    if (error) { setError(error.message); setSaving(false); return; }

    // Clean up photos that were removed while editing.
    const removed = originalImages.filter((u) => !images.includes(u));
    if (removed.length) await deleteCarImages(removed);

    navigate('/admin');
  };

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-64 rounded-2xl bg-slate-200 animate-pulse" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-red-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to cars
      </Link>
      <h1 className="text-2xl font-extrabold mb-6">{isEdit ? 'Edit car' : 'Add a car'}</h1>

      <form onSubmit={save} className="space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-extrabold mb-3">Photos</h2>
          <p className="text-xs text-slate-500 mb-3">The first photo is the cover shown on the showroom. Photos are resized automatically.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((src, i) => (
              <div key={src} className="relative group rounded-xl overflow-hidden border border-slate-200">
                <img src={src} alt="" className="aspect-[16/10] w-full object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">Cover</span>}
                <div className="absolute inset-x-0 bottom-0 bg-black/70 flex justify-between p-1">
                  <button type="button" onClick={() => move(i, -1)} className="p-1.5 text-white hover:bg-white/20 rounded" title="Move earlier"><ArrowLeft className="w-4 h-4" /></button>
                  <button type="button" onClick={() => makeCover(i)} className="p-1.5 text-white hover:bg-white/20 rounded" title="Make cover"><Star className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} className="p-1.5 text-white hover:bg-white/20 rounded" title="Move later"><ArrowRight className="w-4 h-4" /></button>
                  <button type="button" onClick={() => removeImage(i)} className="p-1.5 text-red-300 hover:bg-white/20 rounded" title="Remove"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <label className="aspect-[16/10] rounded-xl border-2 border-dashed border-slate-300 hover:border-red-500 hover:bg-red-50/40 grid place-items-center cursor-pointer text-center text-sm text-slate-500 p-2">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
              {uploading > 0 ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploading}...</span>
              ) : (
                <span className="flex flex-col items-center gap-1"><UploadCloud className="w-6 h-6" /> Add photos</span>
              )}
            </label>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 p-5 grid sm:grid-cols-2 gap-4">
          <h2 className="font-extrabold sm:col-span-2">Details</h2>
          <label className={label}>Brand<input required className={input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" /></label>
          <label className={label}>Model<input required className={input} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" /></label>
          <label className={label}>Year<input required type="number" min="1980" max="2100" className={input} value={year} onChange={(e) => setYear(e.target.value)} /></label>
          <label className={label}>
            Price (₦)
            <input required type="number" min="0" className={input} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8500000" />
            {price && <span className="text-xs text-slate-500 font-normal">{formatNairaFull(Number(price))}</span>}
          </label>
          <label className={`${label} sm:col-span-2`}>
            Title (optional, we'll use year + brand + model if blank)
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2019 Toyota Camry SE, Foreign Used" />
          </label>
          <label className={label}>Condition
            <select className={input} value={condition} onChange={(e) => setCondition(e.target.value as CarCondition)}>{CONDITIONS.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className={label}>Body type
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className={label}>Transmission
            <select className={input} value={transmission} onChange={(e) => setTransmission(e.target.value)}>{TRANSMISSIONS.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className={label}>Fuel
            <select className={input} value={fuel} onChange={(e) => setFuel(e.target.value)}>{FUEL_TYPES.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className={label}>Colour<input className={input} value={color} onChange={(e) => setColor(e.target.value)} placeholder="Black" /></label>
          <label className={label}>Mileage (km)<input type="number" min="0" className={input} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="65000" /></label>
          <label className={`${label} sm:col-span-2`}>Location<input className={input} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Wuse 2, Abuja" /></label>
          <label className={`${label} sm:col-span-2`}>Description
            <textarea rows={5} className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, service history, anything buyers should know." />
          </label>
          <label className={`${label} sm:col-span-2`}>Features (separate with commas)
            <input className={input} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Leather seats, Reverse camera, Sunroof, Apple CarPlay" />
          </label>
          <label className={label}>Status
            <select className={`${input} capitalize`} value={status} onChange={(e) => setStatus(e.target.value as CarStatus)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold self-end pb-2.5">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Mark as featured
          </label>
        </section>

        {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-3">{error}</p>}

        <div className="flex gap-3">
          <button disabled={saving || uploading > 0} className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-60">
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Publish car'}
          </button>
          <Link to="/admin" className="px-6 py-3 rounded-xl border border-slate-300 font-semibold hover:bg-white">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteCarImages, uploadCarImage } from '../lib/images';
import { BODY_CATEGORIES, NIGERIAN_STATES, POPULAR_BRANDS } from '../data/seedData';
import { formatNairaFull, generateCarSlug } from '../utils/formatters';
import { STATUS_LABEL, type AdminStatus, type ListingRow } from './types';

interface Props {
  editId?: string;
  onDone: () => void;
}

const field =
  'w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none';
const lbl = 'block text-[11px] font-bold uppercase text-slate-400 mb-1';
const card = 'bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm';

export function CarForm({ editId, onDone }: Props) {
  const isEdit = Boolean(editId);
  // New cars get their id up front so photos can be stored in that car's folder.
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
  const [condition, setCondition] = useState<ListingRow['condition']>('Foreign Used');
  const [category, setCategory] = useState('Sedan');
  const [transmission, setTransmission] = useState('Automatic');
  const [fuel, setFuel] = useState('Petrol');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [mileageUnit, setMileageUnit] = useState<'km' | 'miles'>('km');
  const [state, setState] = useState('Abuja (FCT)');
  const [area, setArea] = useState('');
  const [vin, setVin] = useState('');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [status, setStatus] = useState<AdminStatus>('active');
  const [featured, setFeatured] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [original, setOriginal] = useState<{ images: string[]; slug: string | null }>({ images: [], slug: null });
  const added = useRef<string[]>([]);

  useEffect(() => {
    if (!editId) return;
    supabase.from('listings').select('*').eq('id', editId).maybeSingle().then(({ data, error }) => {
      if (error || !data) { setError(error?.message || 'Car not found'); setLoading(false); return; }
      const r = data as ListingRow;
      setBrand(r.brand); setModel(r.model); setYear(String(r.year)); setTitle(r.title);
      setPrice(String(r.price)); setCondition(r.condition); setCategory(r.category);
      setTransmission(r.transmission); setFuel(r.fuel_type); setColor(r.color || '');
      setMileage(r.mileage != null ? String(r.mileage) : ''); setMileageUnit(r.mileage_unit);
      setState(r.state); setArea(r.area || ''); setVin(r.vin || '');
      setDescription(r.description || ''); setFeatures(r.features.join(', '));
      setStatus(r.status === 'rejected' ? 'pending' : r.status); setFeatured(r.is_featured);
      setImages(r.images); setOriginal({ images: r.images, slug: r.slug });
      setLoading(false);
    });
  }, [editId]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError('');
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadCarImage(carId, file);
        added.current.push(url);
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

  const cancel = async () => {
    // Throw away photos uploaded in this session that were never saved.
    if (added.current.length) await deleteCarImages(added.current);
    onDone();
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (uploading > 0) { setError('Wait for photos to finish uploading.'); return; }
    if (!images.length) { setError('Add at least one photo.'); return; }

    setSaving(true);
    const finalTitle = title.trim() || `${condition} ${year} ${brand.trim()} ${model.trim()}`;
    const slug =
      original.slug ||
      generateCarSlug(condition, Number(year), brand, model, area || state, carId.slice(0, 6));

    const { error } = await supabase.from('listings').upsert({
      id: carId,
      slug,
      title: finalTitle,
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      price: Number(price),
      condition,
      category,
      state,
      area: area.trim() || null,
      mileage: mileage ? Number(mileage) : null,
      mileage_unit: mileageUnit,
      transmission,
      fuel_type: fuel,
      color: color.trim() || null,
      vin: vin.trim() || null,
      description: description.trim() || null,
      features: features.split(',').map((f) => f.trim()).filter(Boolean),
      images,
      status,
      is_featured: featured,
    });
    if (error) { setError(error.message); setSaving(false); return; }

    // Clean up photos that were removed, and any uploaded-then-removed this session.
    const removed = [...original.images, ...added.current].filter((u) => !images.includes(u));
    if (removed.length) await deleteCarImages(removed);
    onDone();
  };

  const brandData = POPULAR_BRANDS.find((b) => b.name.toLowerCase() === brand.trim().toLowerCase());
  const areas = NIGERIAN_STATES.find((s) => s.name === state)?.areas ?? [];

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-10"><div className="h-64 rounded-3xl bg-slate-200 animate-pulse" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={cancel} className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-emerald-700 mb-4 cursor-pointer">
        <ChevronLeft className="w-4 h-4" /> Back to cars
      </button>
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-6">{isEdit ? 'Edit car' : 'Add a car'}</h1>

      <form onSubmit={save} className="space-y-6">
        <section className={card}>
          <h2 className="font-extrabold text-slate-900 mb-1">Photos</h2>
          <p className="text-xs text-slate-500 font-medium mb-4">The first photo is the cover shown on the car card. Photos are resized automatically.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((src, i) => (
              <div key={src} className="relative rounded-2xl overflow-hidden border border-slate-200">
                <img src={src} alt="" className="aspect-[16/10] w-full object-cover" />
                {i === 0 && <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">COVER</span>}
                <div className="absolute inset-x-0 bottom-0 bg-slate-950/75 flex justify-between p-1">
                  <button type="button" onClick={() => move(i, -1)} title="Move earlier" className="p-1.5 text-white hover:bg-white/20 rounded cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
                  <button type="button" onClick={() => makeCover(i)} title="Make cover" className="p-1.5 text-white hover:bg-white/20 rounded cursor-pointer"><Star className="w-4 h-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} title="Move later" className="p-1.5 text-white hover:bg-white/20 rounded cursor-pointer"><ArrowRight className="w-4 h-4" /></button>
                  <button type="button" onClick={() => removeImage(i)} title="Remove" className="p-1.5 text-red-300 hover:bg-white/20 rounded cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <label className="aspect-[16/10] rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/40 grid place-items-center cursor-pointer text-center text-sm font-semibold text-slate-500 p-2 transition">
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
              {uploading > 0 ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploading}...</span>
              ) : (
                <span className="flex flex-col items-center gap-1"><UploadCloud className="w-6 h-6" /> Add photos</span>
              )}
            </label>
          </div>
        </section>

        <section className={`${card} grid sm:grid-cols-2 gap-4`}>
          <h2 className="font-extrabold text-slate-900 sm:col-span-2">Car details</h2>

          <div>
            <label className={lbl}>Brand</label>
            <input required list="brands" className={field} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Toyota" />
            <datalist id="brands">{POPULAR_BRANDS.map((b) => <option key={b.id} value={b.name} />)}</datalist>
          </div>
          <div>
            <label className={lbl}>Model</label>
            <input required list="models" className={field} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Camry" />
            <datalist id="models">{brandData?.popularModels.map((m) => <option key={m} value={m} />)}</datalist>
          </div>
          <div>
            <label className={lbl}>Year</label>
            <input required type="number" min="1980" max="2100" className={field} value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Price (₦)</label>
            <input required type="number" min="0" className={field} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="8500000" />
            {price && <p className="text-xs text-emerald-700 font-bold mt-1">{formatNairaFull(Number(price))}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Title (optional, auto-filled from condition, year, brand and model)</label>
            <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Foreign Used 2019 Toyota Camry SE" />
          </div>

          <div>
            <label className={lbl}>Condition</label>
            <select className={field} value={condition} onChange={(e) => setCondition(e.target.value as ListingRow['condition'])}>
              {['Foreign Used', 'Nigerian Used', 'Brand New'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Body type</label>
            <select className={field} value={category} onChange={(e) => setCategory(e.target.value)}>
              {BODY_CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Transmission</label>
            <select className={field} value={transmission} onChange={(e) => setTransmission(e.target.value)}>
              {['Automatic', 'Manual', 'CVT'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Fuel</label>
            <select className={field} value={fuel} onChange={(e) => setFuel(e.target.value)}>
              {['Petrol', 'Diesel', 'Hybrid', 'Electric'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Colour</label>
            <input className={field} value={color} onChange={(e) => setColor(e.target.value)} placeholder="Black" />
          </div>
          <div>
            <label className={lbl}>Mileage</label>
            <div className="flex gap-2">
              <input type="number" min="0" className={field} value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="65000" />
              <select className={`${field} w-24`} value={mileageUnit} onChange={(e) => setMileageUnit(e.target.value as 'km' | 'miles')}>
                <option value="km">km</option>
                <option value="miles">miles</option>
              </select>
            </div>
          </div>
          <div>
            <label className={lbl}>State</label>
            <select className={field} value={state} onChange={(e) => { setState(e.target.value); setArea(''); }}>
              {NIGERIAN_STATES.map((s) => <option key={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Area</label>
            <input list="areas" className={field} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Wuse 2" />
            <datalist id="areas">{areas.map((a) => <option key={a} value={a} />)}</datalist>
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Chassis number / VIN (optional)</label>
            <input className={field} value={vin} onChange={(e) => setVin(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Description</label>
            <textarea rows={5} className={field} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Condition, service history, anything buyers should know." />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Features (separate with commas)</label>
            <input className={field} value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Leather seats, Reverse camera, Sunroof" />
          </div>
          <div>
            <label className={lbl}>Status</label>
            <select className={field} value={status} onChange={(e) => setStatus(e.target.value as AdminStatus)}>
              {(Object.keys(STATUS_LABEL) as AdminStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 self-end pb-3">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            Mark as featured
          </label>
        </section>

        {error && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3">{error}</p>}

        <div className="flex gap-3">
          <button
            disabled={saving || uploading > 0}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition disabled:opacity-60 cursor-pointer"
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Publish car'}
          </button>
          <button type="button" onClick={cancel} className="px-6 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, LogOut, Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteCarImages } from '../lib/images';
import { useAuth } from '../auth';
import type { Car, CarStatus } from '../types';
import { STATUSES } from '../types';
import { formatNairaFull } from '../lib/format';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCars((data as Car[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (car: Car, status: CarStatus) => {
    setCars((prev) => prev.map((c) => (c.id === car.id ? { ...c, status } : c)));
    const { error } = await supabase.from('cars').update({ status }).eq('id', car.id);
    if (error) { setError(error.message); load(); }
  };

  const remove = async (car: Car) => {
    if (!confirm(`Delete "${car.title}" and its photos? This can't be undone.`)) return;
    const { error } = await supabase.from('cars').delete().eq('id', car.id);
    if (error) { setError(error.message); return; }
    await deleteCarImages(car.images);
    setCars((prev) => prev.filter((c) => c.id !== car.id));
  };

  const counts = {
    available: cars.filter((c) => c.status === 'available').length,
    reserved: cars.filter((c) => c.status === 'reserved').length,
    sold: cars.filter((c) => c.status === 'sold').length,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">Manage cars</h1>
          <p className="text-sm text-slate-500">{counts.available} available &bull; {counts.reserved} reserved &bull; {counts.sold} sold</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/new" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm">
            <Plus className="w-4 h-4" /> Add car
          </Link>
          <button onClick={signOut} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold hover:bg-white">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 text-red-700 text-sm p-3 mb-4">{error}</p>}

      {loading ? (
        <div className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
      ) : cars.length === 0 ? (
        <div className="text-center bg-white rounded-2xl border border-slate-200 py-14">
          <p className="font-bold text-lg">No cars yet</p>
          <p className="text-sm text-slate-500 mt-1">Add your first car with photos and details.</p>
          <Link to="/admin/new" className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-sm">Add car</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cars.map((car) => (
            <li key={car.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-24 aspect-[16/10] rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  {car.images[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{car.title}</p>
                  <p className="text-sm text-slate-500">{formatNairaFull(car.price)} &bull; {car.images.length} photos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={car.status}
                  onChange={(e) => setStatus(car, e.target.value as CarStatus)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-semibold capitalize"
                  aria-label="Status"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Link to={`/cars/${car.id}`} className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50" title="View"><Eye className="w-4 h-4" /></Link>
                <Link to={`/admin/edit/${car.id}`} className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-50" title="Edit"><Pencil className="w-4 h-4" /></Link>
                <button onClick={() => remove(car)} className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

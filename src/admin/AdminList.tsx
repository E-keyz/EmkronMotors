import { useEffect, useState } from 'react';
import { Eye, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deleteCarImages } from '../lib/images';
import { formatNairaFull } from '../utils/formatters';
import { STATUS_LABEL, type AdminStatus, type ListingRow } from './types';

interface Props {
  onAdd: () => void;
  onEdit: (id: string) => void;
}

export function AdminList({ onAdd, onEdit }: Props) {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRows((data as ListingRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const patch = async (row: ListingRow, changes: Partial<ListingRow>) => {
    setError('');
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...changes } : r)));
    const { error } = await supabase.from('listings').update(changes).eq('id', row.id);
    if (error) { setError(error.message); load(); }
  };

  const remove = async (row: ListingRow) => {
    if (!confirm(`Delete "${row.title}" and its photos? This can't be undone.`)) return;
    const { error } = await supabase.from('listings').delete().eq('id', row.id);
    if (error) { setError(error.message); return; }
    await deleteCarImages(row.images);
    setRows((prev) => prev.filter((r) => r.id !== row.id));
  };

  const count = (s: string) => rows.filter((r) => r.status === s).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Manage cars</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {count('active')} available &bull; {count('sold')} sold &bull; {count('pending')} hidden
          </p>
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add car
        </button>
      </div>

      {error && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 mb-4">{error}</p>}

      {loading ? (
        <div className="h-40 rounded-3xl bg-slate-200 animate-pulse" />
      ) : rows.length === 0 ? (
        <div className="text-center bg-white rounded-3xl border border-slate-200 py-16 shadow-sm">
          <p className="font-extrabold text-lg text-slate-900">No cars yet</p>
          <p className="text-sm text-slate-500 font-medium mt-1">Add your first car with photos and details.</p>
          <button onClick={onAdd} className="mt-5 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold cursor-pointer">
            Add car
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-24 aspect-[16/10] rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {row.images[0] && <img src={row.images[0]} alt="" className={`w-full h-full object-cover ${row.status === 'sold' ? 'grayscale' : ''}`} />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{row.title}</p>
                  <p className="text-sm text-slate-500 font-medium">
                    <span className="text-emerald-700 font-extrabold">{formatNairaFull(row.price)}</span> &bull; {row.images.length} {row.images.length === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={row.status}
                  onChange={(e) => patch(row, { status: e.target.value as AdminStatus })}
                  aria-label="Status"
                  className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2.5 focus:ring-emerald-500 focus:outline-none"
                >
                  {(Object.keys(STATUS_LABEL) as AdminStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                  ))}
                </select>
                <button
                  onClick={() => patch(row, { is_featured: !row.is_featured })}
                  title={row.is_featured ? 'Remove from featured' : 'Mark as featured'}
                  className={`p-2.5 rounded-lg border transition cursor-pointer ${row.is_featured ? 'bg-amber-50 border-amber-300 text-amber-600' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                >
                  <Star className={`w-4 h-4 ${row.is_featured ? 'fill-current' : ''}`} />
                </button>
                <button onClick={() => onEdit(row.id)} title="Edit" className="p-2.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(row)} title="Delete" className="p-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <a href="/" className="inline-flex items-center gap-1.5 mt-6 text-sm font-bold text-slate-500 hover:text-emerald-700 transition">
        <Eye className="w-4 h-4" /> View public site
      </a>
    </div>
  );
}

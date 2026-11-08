import React from 'react';
import { PlusCircle, ShieldCheck, CheckCircle2, Trash2, Eye, ExternalLink, Clock } from 'lucide-react';
import { CarListing } from '../types';
import { formatNaira, timeAgo } from '../utils/formatters';

interface DashboardViewProps {
  myListings: CarListing[];
  onNavigateToSell: () => void;
  onSelectCar: (car: CarListing) => void;
  onMarkAsSold: (id: string) => void;
  onDeleteListing: (id: string) => void;
  currentUser: { name: string; isDealer: boolean } | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  myListings,
  onNavigateToSell,
  onSelectCar,
  onMarkAsSold,
  onDeleteListing,
  currentUser,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seller Dashboard</h1>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Dealer Account</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage your inventory, mark sold vehicles, monitor view counts, and update car listings.
          </p>
        </div>

        <button
          onClick={onNavigateToSell}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Car Ad</span>
        </button>
      </div>

      {/* Inventory Table / Card list */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-base">
            My Active Inventory ({myListings.length})
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            All 36 States Visibility Active
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {myListings.map((car) => (
            <div
              key={car.id}
              className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
            >
              {/* Left Car Info */}
              <div className="flex items-center gap-4">
                <img
                  src={car.images[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&auto=format&fit=crop&q=80'}
                  alt={car.title}
                  className="w-24 h-16 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                        car.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : car.status === 'sold'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {car.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {timeAgo(car.createdAt)}
                    </span>
                  </div>

                  <h3 
                    onClick={() => onSelectCar(car)}
                    className="font-bold text-sm text-slate-900 mt-1 hover:text-emerald-600 transition cursor-pointer"
                  >
                    {car.title}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    {car.condition} &bull; {car.year} &bull; 📍 {car.area ? `${car.area}, ` : ''}{car.state}
                  </p>
                </div>
              </div>

              {/* Right Price & Actions */}
              <div className="flex items-center gap-6 justify-between sm:justify-end">
                <div className="text-right">
                  <div className="text-lg font-extrabold text-emerald-700">
                    {formatNaira(car.price)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium flex items-center justify-end gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{car.viewsCount} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {car.status === 'active' && (
                    <button
                      onClick={() => onMarkAsSold(car.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mark Sold</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectCar(car)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition cursor-pointer flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => onDeleteListing(car.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {myListings.length === 0 && (
            <div className="p-12 text-center text-slate-400 text-sm">
              You haven't posted any cars yet. Click "Post New Car Ad" above to get started.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

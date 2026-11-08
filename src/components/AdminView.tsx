import React, { useState } from 'react';
import { ShieldCheck, Check, X, Flag, AlertTriangle, ArrowLeft, Eye } from 'lucide-react';
import { CarListing, ListingReport } from '../types';
import { formatNaira } from '../utils/formatters';

interface AdminViewProps {
  listings: CarListing[];
  reports: ListingReport[];
  onApproveListing: (id: string) => void;
  onRejectListing: (id: string) => void;
  onToggleDealerVerification: (sellerId: string) => void;
  onResolveReport: (reportId: string) => void;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  listings,
  reports,
  onApproveListing,
  onRejectListing,
  onToggleDealerVerification,
  onResolveReport,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'dealers' | 'reports'>('listings');

  // Unique dealers extracted from listings
  const dealers = Array.from(
    new Map(listings.map(l => [l.seller.id, l.seller])).values()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Admin Top Nav */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Marketplace</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Django Admin Moderation Console
            </h1>
            <span className="bg-slate-900 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">
              Superuser
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'listings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Listings Review ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('dealers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'dealers' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Verified Dealers ({dealers.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            User Reports ({reports.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Listings Review */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Approve or Moderate Car Listings</h2>
            <p className="text-xs text-slate-400">All newly submitted listings undergo moderation check.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {listings.slice(0, 15).map((car) => (
              <div key={car.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={car.images[0]} alt={car.title} className="w-20 h-14 object-cover rounded-xl border border-slate-200 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        car.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {car.status}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{car.condition} &bull; {car.year}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 mt-0.5">{car.title}</h4>
                    <span className="text-xs text-slate-500">Seller: {car.seller.dealershipName || car.seller.name} &bull; {car.state}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="font-extrabold text-emerald-700 text-base">{formatNaira(car.price)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {car.status !== 'active' ? (
                      <button
                        onClick={() => onApproveListing(car.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}

                    <button
                      onClick={() => onRejectListing(car.id)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Verified Dealers */}
      {activeTab === 'dealers' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Registered Nigerian Dealers & Badges</h2>
            <p className="text-xs text-slate-400">Toggle "Verified Dealer" status to build marketplace buyer trust.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {dealers.map((dealer) => (
              <div key={dealer.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={dealer.avatarUrl} alt={dealer.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900">{dealer.dealershipName || dealer.name}</h4>
                      {dealer.isVerifiedDealer && (
                        <span className="text-emerald-600 font-bold text-xs flex items-center gap-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">Phone: {dealer.phone} &bull; 📍 {dealer.location}</p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => onToggleDealerVerification(dealer.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      dealer.isVerifiedDealer
                        ? 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                    }`}
                  >
                    {dealer.isVerifiedDealer ? 'Revoke Badge' : 'Grant Verified Badge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Reports */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Reported Car Listings Queue</h2>
            <p className="text-xs text-slate-400">Investigate fraud, fake prices, or already sold vehicle listings.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {reports.map((report) => (
              <div key={report.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-red-800">
                      {report.reason.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400">{report.createdAt}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    Listing: "{report.listingTitle}"
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Notes: {report.details || 'No detailed note provided.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {report.status === 'pending' ? (
                    <button
                      onClick={() => onResolveReport(report.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                    >
                      Resolve & Dismiss
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">Resolved</span>
                  )}
                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm">
                No active user reports at this time.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

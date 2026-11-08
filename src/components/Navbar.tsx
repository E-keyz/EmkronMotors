import React from 'react';
import { Car, PlusCircle, ShieldCheck, Search } from 'lucide-react';
import { sellCarWhatsAppLink } from '../lib/contact';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  totalListingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  totalListingsCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro announcement bar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="font-medium">
              <strong className="text-white">Emkron Motors</strong> &bull; <span className="text-red-400 font-semibold italic">Drive with confidence</span> &bull; <strong className="text-white">{totalListingsCount}</strong> Verified Cars in Nigeria
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('/cars')}
              className="flex items-center gap-3 text-left cursor-pointer group"
              title="Emkron - Drive with confidence"
            >
              <img
                src="/assets/emkron-logo.png"
                alt="Emkron Motors"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </button>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold text-slate-700">
              <button
                onClick={() => onNavigate('/cars')}
                className={`transition cursor-pointer ${
                  currentRoute === '/cars' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                All Cars
              </button>
              <button
                onClick={() => onNavigate('/cars/in/lagos')}
                className={`transition cursor-pointer ${
                  currentRoute === '/cars/in/lagos' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                Lagos Cars
              </button>
              <button
                onClick={() => onNavigate('/cars/in/abuja')}
                className={`transition cursor-pointer ${
                  currentRoute === '/cars/in/abuja' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                Abuja Cars
              </button>
              <button
                onClick={() => onNavigate('/cars/toyota')}
                className={`transition cursor-pointer ${
                  currentRoute === '/cars/toyota' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                Toyota
              </button>
              <button
                onClick={() => onNavigate('/cars/mercedes-benz')}
                className={`transition cursor-pointer ${
                  currentRoute === '/cars/mercedes-benz' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                Mercedes-Benz
              </button>
              <button
                onClick={() => onNavigate('/listings/category/suv')}
                className={`transition cursor-pointer ${
                  currentRoute === '/listings/category/suv' ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                }`}
              >
                SUVs
              </button>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Sell Car CTA: opens WhatsApp chat with the business */}
            <a
              href={sellCarWhatsAppLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-emerald-600/20 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Sell My Car</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

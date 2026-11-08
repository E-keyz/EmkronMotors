import { Link, Outlet, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { BUSINESS_NAME, TAGLINE, SELL_MESSAGE, whatsappLink } from '../config';
import { isSupabaseConfigured } from '../lib/supabase';

export function Layout() {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-black text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img
              src="/logo.png"
              alt={BUSINESS_NAME}
              className="h-9 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-extrabold text-lg tracking-tight truncate">{BUSINESS_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(SELL_MESSAGE)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-sm font-bold transition"
            >
              <MessageCircle className="w-4 h-4" />
              Sell your car
            </a>
          </div>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-amber-100 text-amber-900 text-sm px-4 py-3 text-center">
          Supabase isn't connected yet. Copy <code>.env.example</code> to <code>.env</code>, add your keys, and restart.
        </div>
      )}

      <main className="flex-1">
        <Outlet />
      </main>

      {!isAdminArea && (
        <footer className="bg-black text-slate-400 text-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 justify-between">
            <div>
              <p className="text-white font-bold">{BUSINESS_NAME}</p>
              <p>{TAGLINE}</p>
            </div>
            <div className="sm:text-right">
              <p>&copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
              <Link to="/admin" className="text-slate-600 hover:text-slate-400">Staff login</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

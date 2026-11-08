import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { AdminLogin } from './AdminLogin';
import { AdminList } from './AdminList';
import { CarForm } from './CarForm';

type View = { name: 'list' } | { name: 'form'; id?: string };

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [view, setView] = useState<View>({ name: 'list' });

  // Keep this page out of search engines.
  useEffect(() => {
    document.title = 'Admin | Emkron Motors';
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex,nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) { setIsAdmin(false); setChecking(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    setChecking(true);
    supabase.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => { setIsAdmin(Boolean(data)); setChecking(false); });
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };
  const signOut = () => supabase.auth.signOut();

  let body;
  if (!isSupabaseConfigured) {
    body = (
      <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-600 font-medium">
        Supabase isn't connected yet. Add your keys to <code>.env</code> and restart.
      </div>
    );
  } else if (checking) {
    body = <div className="py-24 text-center text-slate-500 font-medium">Loading...</div>;
  } else if (!session || !isAdmin) {
    body = <AdminLogin onSignIn={signIn} notAdmin={Boolean(session && !isAdmin)} onSignOut={signOut} />;
  } else if (view.name === 'form') {
    body = <CarForm key={view.id || 'new'} editId={view.id} onDone={() => setView({ name: 'list' })} />;
  } else {
    body = <AdminList onAdd={() => setView({ name: 'form' })} onEdit={(id) => setView({ name: 'form', id })} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/emkron-logo.png" alt="Emkron Motors" className="h-10 w-auto object-contain" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 border border-slate-200 rounded-md px-2 py-0.5">Admin</span>
          </a>
          {session && isAdmin && (
            <button onClick={signOut} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
      </header>
      {body}
    </div>
  );
}

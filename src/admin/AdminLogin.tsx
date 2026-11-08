import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';

interface Props {
  onSignIn: (email: string, password: string) => Promise<string | null>;
  notAdmin: boolean;
  onSignOut: () => void;
}

export function AdminLogin({ onSignIn, notAdmin, onSignOut }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const err = await onSignIn(email.trim(), password);
    if (err) setError(err);
    setBusy(false);
  };

  const field =
    'w-full text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none';

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-slate-200 p-7 shadow-md">
        <div className="w-11 h-11 rounded-2xl bg-slate-950 text-white grid place-items-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">Admin login</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Sign in to add and manage your cars.</p>

        {notAdmin && (
          <div className="mt-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 font-medium">
            You're signed in, but this account isn't an admin. Add it to the <code>admins</code> table in Supabase
            (step 5 in <code>schema.sql</code>).
            <button onClick={onSignOut} className="block mt-2 font-bold underline cursor-pointer">Sign out</button>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Email</label>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Password</label>
            <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
          </div>
          {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
          <button
            disabled={busy}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-60 cursor-pointer"
          >
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

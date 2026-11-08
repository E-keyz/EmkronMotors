import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { BUSINESS_NAME } from '../config';

export default function AdminLogin() {
  const { signIn, session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) navigate('/admin', { replace: true });
  }, [loading, session, isAdmin, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const err = await signIn(email.trim(), password);
    if (err) setError(err);
    setBusy(false);
  };

  const notAdmin = !loading && session && !isAdmin;

  return (
    <div className="max-w-sm mx-auto px-4 py-16">
      <h1 className="text-2xl font-extrabold">{BUSINESS_NAME} staff login</h1>
      <p className="text-sm text-slate-500 mt-1">Sign in to add and manage cars.</p>

      {notAdmin && (
        <div className="mt-5 rounded-lg bg-amber-50 text-amber-900 text-sm p-3">
          You're signed in, but this account isn't an admin yet. Add it to the <code>admins</code> table in Supabase (step 5 in <code>schema.sql</code>).
          <button onClick={signOut} className="block mt-2 font-bold underline">Sign out</button>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-semibold">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" autoComplete="email" />
        </label>
        <label className="block text-sm font-semibold">
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" autoComplete="current-password" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-black text-white font-bold disabled:opacity-60">
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

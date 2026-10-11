'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { browserSupabase } from '@/lib/supabase/browser';

export function SignInForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const next = params.get('next');
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/contribute';
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const supabase = browserSupabase();
    if (!supabase) { setMessage('Account setup is still in progress. Please check back soon.'); return; }
    setBusy(true);
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(destination)}` } });
    setMessage(error ? error.message : 'Check your inbox for the sign-in link. You can return here after opening it.');
    setBusy(false);
  }
  return <section className="panel auth-panel"><h2>Get a sign-in link</h2><p className="muted">No VTOP password needed. An email address alone does not verify enrollment.</p><form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="primary-link" disabled={busy}>{busy ? 'Sending…' : 'Email me a link'}</button></form>{params.get('error') && <p role="alert">That link could not be used. Please request a new one.</p>}{message && <p role="status">{message}</p>}</section>;
}

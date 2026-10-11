'use client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { browserSupabase } from '@/lib/supabase/browser';
import { vitGoogleSignInEnabled } from '@/lib/supabase/config';
import { safeNextPath } from '@/lib/safe-next-path';

export function SignInForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const destination = safeNextPath(params.get('next'));
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
  async function signInWithVitGoogle() {
    const supabase = browserSupabase();
    if (!supabase) { setMessage('Account setup is still in progress. Please check back soon.'); return; }
    setBusy(true);
    const origin = window.location.origin;
    const redirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(destination)}&vit=1`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { hd: 'vitstudent.ac.in', prompt: 'select_account' } },
    });
    if (error) { setMessage(error.message); setBusy(false); }
  }
  return <section className="panel auth-panel"><h2>Sign in to review</h2><p className="muted">No VTOP password needed. Signing in does not prove which faculty taught you.</p>{vitGoogleSignInEnabled && <div className="vit-google-option"><button type="button" className="primary-link" disabled={busy} onClick={signInWithVitGoogle}>Continue with VIT Google account</button><p className="muted">This uses Google sign-in, so no OTP email is sent. It only works if VIT permits this app.</p></div>}<form onSubmit={submit}><label>Email address<input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="primary-link" disabled={busy}>{busy ? 'Sending…' : 'Email me a link'}</button></form><p className="muted">If VIT mail blocks outside messages, use an address that receives external mail. Reviews made this way remain self-attested.</p>{params.get('error') === 'vit' ? <p role="alert">Choose a verified @vitstudent.ac.in Google account. If VIT blocks this app, use email sign-in for a self-attested review.</p> : params.get('error') && <p role="alert">That sign-in link could not be used. Please try again.</p>}{message && <p role="status">{message}</p>}</section>;
}

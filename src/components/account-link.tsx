'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { browserSupabase } from '@/lib/supabase/browser';

export function AccountLink() {
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const supabase = browserSupabase();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => subscription.subscription.unsubscribe();
  }, []);
  if (!signedIn) return <Link href="/sign-in">Sign in</Link>;
  return <button className="nav-button" type="button" onClick={async () => { await browserSupabase()?.auth.signOut(); setSignedIn(false); router.push('/'); router.refresh(); }}>Sign out</button>;
}

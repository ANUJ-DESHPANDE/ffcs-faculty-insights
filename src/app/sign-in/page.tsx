import { SignInForm } from '@/components/sign-in-form';
import { Suspense } from 'react';

export default function SignInPage() {
  return <main className="page-wrap"><div className="page-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Sign in to contribute.</h1><p>Your account stays private; public reviews show “Anonymous student.”</p></div><Suspense fallback={<p>Loading sign-in…</p>}><SignInForm /></Suspense></main>;
}

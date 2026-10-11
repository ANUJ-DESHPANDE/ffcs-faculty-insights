import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/safe-next-path';

export async function GET(request: NextRequest) {
  const destination = safeNextPath(request.nextUrl.searchParams.get('next'));
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.redirect(new URL('/sign-in?error=setup', request.url));
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const code = request.nextUrl.searchParams.get('code');
  const type = request.nextUrl.searchParams.get('type');
  let error = true;
  if (tokenHash && (type === 'email' || type === 'magiclink')) {
    error = Boolean((await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })).error);
  } else if (code) {
    error = Boolean((await supabase.auth.exchangeCodeForSession(code)).error);
  }
  if (!error && request.nextUrl.searchParams.get('vit') === '1') {
    const { data: { user } } = await supabase.auth.getUser();
    const accountEmail = user?.email?.toLowerCase();
    const isVitGoogle = Boolean(
      user &&
      accountEmail?.endsWith('@vitstudent.ac.in') &&
      user.email_confirmed_at &&
      user.identities?.some(identity =>
        identity.provider === 'google' &&
        identity.identity_data?.email?.toLowerCase() === accountEmail &&
        identity.identity_data?.email_verified === true,
      ),
    );
    if (!isVitGoogle) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/sign-in?error=vit', request.url));
    }
  }
  return NextResponse.redirect(new URL(error ? '/sign-in?error=link' : destination, request.url));
}

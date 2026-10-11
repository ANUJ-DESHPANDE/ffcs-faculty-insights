import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next');
  const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/contribute';
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
  return NextResponse.redirect(new URL(error ? '/sign-in?error=link' : destination, request.url));
}

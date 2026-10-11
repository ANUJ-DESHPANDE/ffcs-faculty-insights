import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const privateHeaders = { 'Cache-Control': 'private, no-store' };

export async function GET() {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json({ error: 'Review collection is not configured.' }, { status: 503, headers: privateHeaders });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to see your progress.' }, { status: 401, headers: privateHeaders });
  const { data, error } = await supabase.rpc('my_contributions');
  return error ? NextResponse.json({ error: 'Could not load your progress.' }, { status: 503, headers: privateHeaders }) : NextResponse.json(data ?? [], { headers: privateHeaders });
}

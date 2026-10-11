import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json([]);
  const { data, error } = await supabase.rpc('review_summaries');
  return error ? NextResponse.json({ error: 'Ratings unavailable.' }, { status: 503 }) : NextResponse.json(data ?? []);
}

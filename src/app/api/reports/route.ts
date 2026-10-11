import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';
export async function POST(request: NextRequest) {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json({ error: 'Reporting is unavailable.' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to report a review.' }, { status: 401 });
  let body: { reviewId?: string; reason?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  if (!body.reviewId || !['spam', 'harassment', 'private_info', 'other'].includes(body.reason ?? ''))
    return NextResponse.json({ error: 'Choose a reason.' }, { status: 400 });
  const { error } = await supabase.rpc('report_review', { p_review_id: body.reviewId, p_reason: body.reason });
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}

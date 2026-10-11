import { NextRequest, NextResponse } from 'next/server';
import { facultyById, courseByCode } from '@/lib/catalog';
import { parseReviewInput } from '@/lib/review-input';
import { serverSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json({ error: 'Review collection is not configured yet.' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to submit a review.' }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const parsed = parseReviewInput(body);
  if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const review = parsed.data;
  if (!facultyById.has(review.facultyId) || (review.courseCode && !courseByCode.has(review.courseCode)))
    return NextResponse.json({ error: 'Choose a faculty and course from the directory.' }, { status: 400 });
  const { data, error } = await supabase.rpc('save_review', {
    p_faculty_id: review.facultyId,
    p_course_code: review.courseCode,
    p_overall: review.overall, p_teaching: review.teaching, p_grading: review.grading,
    p_workload: review.workload, p_lab_ease: review.labEase,
    p_would_take_again: review.wouldTakeAgain, p_comment: review.comment,
    p_studied_under_faculty: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data, status: 'pending' });
}

export async function DELETE(request: NextRequest) {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json({ error: 'Review collection is not configured.' }, { status: 503 });
  if (!(await supabase.auth.getUser()).data.user) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  const facultyId = request.nextUrl.searchParams.get('facultyId') ?? '';
  if (!facultyById.has(facultyId)) return NextResponse.json({ error: 'Faculty not found.' }, { status: 400 });
  const { error } = await supabase.rpc('delete_my_review', { p_faculty_id: facultyId });
  return error ? NextResponse.json({ error: 'Could not delete the review.' }, { status: 400 }) : NextResponse.json({ ok: true });
}

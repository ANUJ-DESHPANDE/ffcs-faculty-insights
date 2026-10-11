import { NextRequest, NextResponse } from 'next/server';
import { facultyById, courseByCode } from '@/lib/catalog';
import { serverSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const score = (value: unknown) => value === null || value === undefined || value === '' ? null : Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5 ? value : NaN;

export async function POST(request: NextRequest) {
  const supabase = await serverSupabase();
  if (!supabase) return NextResponse.json({ error: 'Review collection is not configured yet.' }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in to submit a review.' }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }
  const facultyId = typeof body.facultyId === 'string' ? body.facultyId : '';
  const courseCode = typeof body.courseCode === 'string' && body.courseCode ? body.courseCode : null;
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  const ratings = ['overall', 'teaching', 'grading', 'workload', 'labEase'].map(key => score(body[key]));
  if (!facultyById.has(facultyId) || (courseCode && !courseByCode.has(courseCode)) ||
      ratings[0] === null || ratings.some(value => Number.isNaN(value)) ||
      (comment && (comment.length < 20 || comment.length > 800)) || body.studiedUnderFaculty !== true ||
      (body.wouldTakeAgain !== null && body.wouldTakeAgain !== true && body.wouldTakeAgain !== false)) {
    return NextResponse.json({ error: 'Check the faculty, ratings, written note, and confirmation.' }, { status: 400 });
  }
  const { data, error } = await supabase.rpc('save_review', {
    p_faculty_id: facultyId,
    p_course_code: courseCode,
    p_overall: ratings[0], p_teaching: ratings[1], p_grading: ratings[2],
    p_workload: ratings[3], p_lab_ease: ratings[4],
    p_would_take_again: body.wouldTakeAgain, p_comment: comment || null,
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

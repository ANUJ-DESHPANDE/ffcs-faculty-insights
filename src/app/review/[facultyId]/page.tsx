import Link from 'next/link';
import { notFound } from 'next/navigation';
import { facultyById, offeringsForFaculty, courseByCode } from '@/lib/catalog';
import { serverSupabase } from '@/lib/supabase/server';
import { ReviewForm } from '@/components/review-form';

export default async function ReviewPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const { facultyId } = await params;
  const person = facultyById.get(facultyId);
  if (!person) notFound();
  const supabase = await serverSupabase();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;
  const courseCodes = [...new Set(offeringsForFaculty(facultyId).map(row => row.courseCode))];
  const courses = courseCodes.map(code => ({ code, title: courseByCode.get(code)?.title ?? code }));
  const existing = user && supabase ? (await supabase.rpc('my_review', { p_faculty_id: facultyId })).data?.[0] : null;
  return <main className="page-wrap"><div className="breadcrumbs"><Link href={`/faculty/${facultyId}`}>{person.name}</Link> / Review</div><div className="page-intro"><span className="eyebrow">PASS IT FORWARD</span><h1>Review {person.name}</h1><p>A quick, honest note can help the next student decide. Your name and email never appear with your public review.</p></div>{!supabase ? <div className="context-note">Review collection is being set up. Please check back soon.</div> : !user ? <section className="panel"><h2>First, sign in</h2><p className="muted">One private account helps us prevent duplicate reviews and lets you edit later. Email sign-in does not verify enrollment.</p><Link className="primary-link" href={`/sign-in?next=${encodeURIComponent(`/review/${facultyId}`)}`}>Get a sign-in link →</Link></section> : <ReviewForm facultyId={facultyId} courses={courses} existing={existing ?? undefined} />}</main>;
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShortlistButton } from '@/components/shortlist-button';
import { ReportButton } from '@/components/report-button';
import { courseByCode, facultyById, offeringsForFaculty, scoreLabel } from '@/lib/catalog';
import { reputationFrom, type SummaryRow } from '@/lib/reputation';
import { serverSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
type Published = { id: string; course_code: string | null; overall: number; teaching: number | null; grading: number | null; workload: number | null; lab_ease: number | null; would_take_again: boolean | null; comment: string | null; published_on: string };
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const person = facultyById.get(id);
  return { title: person ? person.name : 'Faculty', description: person ? `Student experiences and historical course associations for ${person.name}.` : undefined, openGraph: { title: person ? `${person.name} | FFCS Faculty Insights` : 'Faculty Insights', description: 'Read moderated anonymous student experiences. Course history is from June 2026.' } };
}
export default async function FacultyProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = facultyById.get(id);
  if (!person) notFound();
  const rows = offeringsForFaculty(id);
  const courseCodes = [...new Set(rows.map(row => row.courseCode))];
  const supabase = await serverSupabase();
  let summary: SummaryRow | undefined;
  let reviews: Published[] = [];
  let discussions: { url: string; added_on: string }[] = [];
  if (supabase) {
    const [summariesResult, reviewsResult, discussionsResult] = await Promise.all([
      supabase.rpc('review_summaries'),
      supabase.rpc('published_reviews_for', { p_faculty_id: id, p_limit: 30 }),
      supabase.rpc('discussion_links_for', { p_faculty_id: id }),
    ]);
    summary = summariesResult.data?.find((row: SummaryRow) => row.faculty_id === id);
    reviews = reviewsResult.data ?? [];
    discussions = discussionsResult.data ?? [];
  }
  const rep = reputationFrom(summary);
  return <main className="page-wrap">
    <div className="breadcrumbs"><Link href="/faculty">Faculty</Link> / {person.name}</div>
    <div className="profile-head"><div><span className="eyebrow">FACULTY PROFILE</span><h1>{person.name}</h1><p>{courseCodes.length} known courses in the June 2026 public archive</p></div><ShortlistButton id={id} /></div>
    <section className="panel profile-overview"><div><span className="eyebrow">THE QUICK TAKE</span><div className="reputation-head"><strong>{scoreLabel(rep.overall)}<small>{rep.overall === null ? '' : ' / 5'}</small></strong><div><b>{rep.count} published {rep.count === 1 ? 'review' : 'reviews'}</b><span>{rep.confidence}</span></div></div><p className="muted">{rep.count < 5 ? 'More student experiences are needed before showing an aggregate score.' : 'Scores are from moderated, self-attested student reviews; enrollment is not verified.'}</p></div><Link className="primary-link" href={`/review/${id}`}>Review this faculty →</Link></section>
    <div className="quick-metrics">{[
      ['Teaching', rep.teaching, rep.teachingCount], ['Grading generosity', rep.grading, rep.gradingCount],
      ['Workload', rep.workload, rep.workloadCount], ['Lab ease', rep.labEase, rep.labEaseCount],
    ].map(([label, value, count]) => <div className="panel" key={label as string}><span>{label}</span><strong>{scoreLabel(value as number | null)}</strong><small>{count as number} {count === 1 ? 'rating' : 'ratings'}</small></div>)}</div>
    <section className="panel experiences"><div className="section-heading"><div><span className="eyebrow">ANONYMOUS STUDENT EXPERIENCES</span><h2>What students say</h2></div><span>{reviews.filter(review => review.comment).length} written notes</span></div>
      {reviews.some(review => review.comment) ? reviews.filter(review => review.comment).map(review => <article className="experience" key={review.id}><div className="experience-meta"><strong>Anonymous student</strong><span>{review.course_code ? `${review.course_code} · ` : ''}{review.published_on}</span></div><p>{review.comment}</p><div className="experience-bottom"><span>Overall {review.overall}/5{review.would_take_again === null ? '' : review.would_take_again ? ' · Would take again' : ' · Would not take again'}</span><ReportButton reviewId={review.id} /></div></article>) : <div className="empty-state"><h3>No written experiences yet.</h3><p>If you studied under this faculty, a short honest note can help someone choose.</p><Link className="text-link" href={`/review/${id}`}>Share your experience →</Link></div>}
    </section>
    {discussions.length > 0 && <section className="panel discussions"><span className="eyebrow">EXTERNAL DISCUSSIONS</span><h2>More perspectives elsewhere</h2><p className="muted">Administrator curated Reddit links. These discussions are not authenticated student reviews, and their opinions do not affect ratings.</p>{discussions.map(link => <p key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">Open Reddit discussion ↗</a> <small>Added {link.added_on}</small></p>)}</section>}
    <div className="profile-layout"><div><section className="panel"><span className="eyebrow">COURSE HISTORY</span><h2>Known courses</h2><p className="muted">Associations from a dated source snapshot. They do not confirm current availability.</p><div className="course-history">{courseCodes.map(code => <Link key={code} href={`/courses/${code}`}><code>{code}</code><span>{courseByCode.get(code)?.title ?? code}</span><b>↗</b></Link>)}</div></section></div><div><section className="panel"><span className="eyebrow">SLOT HISTORY</span><h2>Archived offerings</h2><div className="offering-table">{rows.slice(0, 30).map(row => <div key={row.id}><Link href={`/courses/${row.courseCode}`}>{row.courseCode}</Link><strong>{row.slot || '—'}</strong><span>{row.venue || '—'}</span></div>)}</div>{rows.length > 30 && <p className="muted">Showing 30 of {rows.length} rows.</p>}</section><section className="panel"><span className="eyebrow">GRADE EVIDENCE</span><h2>No grade curves yet</h2><p className="muted">A curve needs a specific faculty, course and class offering. We do not infer it from review ratings.</p></section></div></div>
  </main>;
}

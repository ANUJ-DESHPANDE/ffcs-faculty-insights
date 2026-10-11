import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { serverSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
type QueueItem = { id: string; faculty_id: string; faculty_name: string; overall: number; comment: string | null; status: string; updated_at: string; report_count: number };
type CoverageItem = { faculty_id: string; faculty_name: string; review_count: number; written_count: number };

async function moderate(formData: FormData) {
  'use server';
  const reviewId = String(formData.get('reviewId') ?? '');
  const action = String(formData.get('action') ?? '');
  if (!/^[0-9a-f-]{36}$/i.test(reviewId) || !['publish', 'hide', 'reopen'].includes(action)) return;
  const supabase = await serverSupabase();
  if (!supabase || !(await supabase.auth.getUser()).data.user) return;
  const { error } = await supabase.rpc('admin_moderate', { p_review_id: reviewId, p_action: action });
  if (error) throw new Error('Moderation failed. Please try again.');
  revalidatePath('/admin');
  revalidatePath('/faculty');
}

async function addDiscussion(formData: FormData) {
  'use server';
  const facultyId = String(formData.get('facultyId') ?? '');
  const url = String(formData.get('url') ?? '');
  const supabase = await serverSupabase();
  if (!supabase || !(await supabase.auth.getUser()).data.user) return;
  const { error } = await supabase.rpc('admin_add_discussion', { p_faculty_id: facultyId, p_url: url });
  if (error) throw new Error('Could not add the discussion link. Check its URL and faculty ID.');
  revalidatePath(`/faculty/${facultyId}`);
  revalidatePath('/admin');
}

export default async function AdminPage() {
  const supabase = await serverSupabase();
  if (!supabase || !(await supabase.auth.getUser()).data.user) notFound();
  const [overviewResult, queueResult, coverageResult] = await Promise.all([
    supabase.rpc('admin_overview'), supabase.rpc('admin_review_queue'), supabase.rpc('admin_coverage'),
  ]);
  if (overviewResult.error || queueResult.error || coverageResult.error) notFound();
  const overview = overviewResult.data as Record<string, number>;
  const queue = queueResult.data as QueueItem[];
  const coverage = coverageResult.data as CoverageItem[];
  const oneOrTwo = coverage.filter(item => item.review_count >= 1 && item.review_count <= 2);
  const mostReviewed = [...coverage].sort((a, b) => b.review_count - a.review_count).slice(0, 10);
  return <main className="page-wrap admin-page"><div className="page-intro"><span className="eyebrow">PRIVATE OPERATIONS</span><h1>Community dashboard</h1><p>Review submissions before they appear publicly. Check reports and find coverage gaps.</p></div><div className="admin-stats">{[
    ['Accounts', overview.users], ['Reviews submitted', overview.reviews], ['Pending', overview.pending],
    ['Published', overview.published], ['Last 24 hours', overview.last24h], ['Open reports', overview.reports],
    ['Faculty with no reviews', overview.faculty_without_reviews], ['Faculty with 1–2 reviews', oneOrTwo.length],
  ].map(([label, value]) => <div className="panel" key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
  <section className="panel"><span className="eyebrow">ACTION NEEDED</span><h2>Review queue</h2>{queue.length ? queue.map(item => <article className="admin-review" key={item.id}><div><Link href={`/faculty/${item.faculty_id}`}>{item.faculty_name}</Link><small>{item.status} · Overall {item.overall}/5 · {item.report_count} open reports · {new Date(item.updated_at).toLocaleDateString()}</small></div><p>{item.comment ?? 'No written note.'}</p><form action={moderate}><input type="hidden" name="reviewId" value={item.id} /><button name="action" value="publish">Publish / keep</button><button name="action" value="hide">Hide</button><button name="action" value="reopen">Reopen</button></form></article>) : <p className="muted">Queue is clear.</p>}</section>
  <section className="panel"><span className="eyebrow">EXTERNAL REFERENCES</span><h2>Add a curated Reddit link</h2><p className="muted">Check context and relevance yourself. Link directly to a discussion; do not copy comments or treat them as verified reviews.</p><form action={addDiscussion} className="admin-link-form"><label>Faculty ID<input name="facultyId" required placeholder="faculty-id-from-profile-url" /></label><label>Reddit discussion URL<input name="url" type="url" required placeholder="https://www.reddit.com/r/.../comments/..." /></label><button type="submit">Add link</button></form></section>
  <section className="panel"><span className="eyebrow">COVERAGE</span><h2>Where experience is missing</h2><p className="muted">Invite real former students to contribute; never seed invented reviews.</p><h3>Faculty with 1–2 reviews</h3><div className="coverage-list">{oneOrTwo.length ? oneOrTwo.map(item => <div key={item.faculty_id}><Link href={`/faculty/${item.faculty_id}`}>{item.faculty_name}</Link><span>{item.review_count} reviews · {item.written_count} written</span></div>) : <p className="muted">None yet.</p>}</div><h3>Most reviewed</h3><div className="coverage-list">{mostReviewed.filter(item => item.review_count > 0).map(item => <div key={item.faculty_id}><Link href={`/faculty/${item.faculty_id}`}>{item.faculty_name}</Link><span>{item.review_count} reviews · {item.written_count} written</span></div>)}</div><h3>All faculty, least reviewed first</h3><div className="coverage-list">{coverage.map(item => <div key={item.faculty_id}><Link href={`/faculty/${item.faculty_id}`}>{item.faculty_name}</Link><span>{item.review_count} reviews · {item.written_count} written</span></div>)}</div></section></main>;
}

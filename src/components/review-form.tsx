'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Existing = { course_code: string | null; overall: number; teaching: number | null; grading: number | null; workload: number | null; lab_ease: number | null; would_take_again: boolean | null; comment: string | null; status: string };
const questions = [
  { key: 'teaching', label: 'Teaching', low: 'Hard to follow', high: 'Very clear' },
  { key: 'grading', label: 'Grading generosity', low: 'Strict', high: 'Generous' },
  { key: 'workload', label: 'Workload', low: 'Light', high: 'Heavy' },
  { key: 'labEase', label: 'Lab ease', low: 'Demanding', high: 'Relaxed' },
] as const;
type RatingKey = typeof questions[number]['key'];
type Ratings = Record<RatingKey, number | null>;

function Scale({ name, value, onChange, low, high }: { name: string; value: number | null; onChange: (score: number) => void; low: string; high: string }) {
  return <div className="scale"><small>{low}</small><div className="rating-options">{[1, 2, 3, 4, 5].map(n => <label key={n}><input type="radio" name={name} checked={value === n} onChange={() => onChange(n)} /><span>{n}</span></label>)}</div><small>{high}</small></div>;
}

export function ReviewForm({ facultyId, courses, existing }: { facultyId: string; courses: { code: string; title: string }[]; existing?: Existing }) {
  const router = useRouter();
  const [overall, setOverall] = useState<number | null>(existing?.overall ?? null);
  const [ratings, setRatings] = useState<Ratings>({ teaching: existing?.teaching ?? null, grading: existing?.grading ?? null, workload: existing?.workload ?? null, labEase: existing?.lab_ease ?? null });
  const [courseCode, setCourseCode] = useState(existing?.course_code ?? '');
  const [again, setAgain] = useState<boolean | null>(existing?.would_take_again ?? null);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [prompt, setPrompt] = useState('What should another student know before choosing this faculty?');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError('');
    if (overall === null) { setError('Choose an overall rating.'); return; }
    if (comment.trim() && comment.trim().length < 20) { setError('Add a little more detail, or leave the note blank.'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/reviews', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ facultyId, courseCode, overall, ...ratings, wouldTakeAgain: again, comment, studiedUnderFaculty: attested }) });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? 'Could not save your review.'); return; }
      setDone(true);
    } catch { setError('Connection lost. Your review was not saved. Try again.'); }
    finally { setBusy(false); }
  }
  async function remove() {
    if (!window.confirm('Delete your review permanently? This also removes it from public scores.')) return;
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/reviews?facultyId=${encodeURIComponent(facultyId)}`, { method: 'DELETE' });
      if (!response.ok) { setError('Could not delete your review. Please try again.'); return; }
      router.push(`/faculty/${facultyId}`);
      router.refresh();
    } catch { setError('Connection lost. Please try again.'); }
    finally { setBusy(false); }
  }
  if (done) return <section className="panel review-success"><span className="eyebrow">SAVED</span><h2>Thanks for helping the next student.</h2><p>Your review is saved and waiting for moderation. It will appear anonymously after approval.</p><Link className="primary-link" href={`/faculty/${facultyId}`}>Back to faculty profile →</Link></section>;
  return <form className="review-form" onSubmit={submit}>
    {existing && <div className="context-note">You are editing your {existing.status} review. Saving sends it back for moderation.</div>}
    <section className="panel"><span className="eyebrow">THE QUICK TAKE</span><h2>How was your overall experience?</h2><p className="muted">Choose one number. 1 = poor, 5 = excellent.</p><Scale name="overall" value={overall} onChange={setOverall} low="Poor" high="Excellent" />
      <label className="field-label">Course <small>(optional)</small><select value={courseCode} onChange={e => setCourseCode(e.target.value)}><option value="">Skip course</option>{courses.map(course => <option key={course.code} value={course.code}>{course.code} · {course.title}</option>)}</select></label>
    </section>
    <section className="panel"><span className="eyebrow">IN YOUR WORDS</span><h2>What should the next student know?</h2><p className="muted">A sentence or two is plenty. Mention what shaped your rating and your bottom line. Skip if you prefer.</p><div className="prompt-chips" aria-label="Writing ideas">{[
      ['Teaching', 'How clearly did they teach? What helped or confused you?'],
      ['Grading', 'How fair or generous was checking?'],
      ['Workload', 'How much work did the course need?'],
      ['Labs', 'If you had a lab, how were submissions, vivas or records?'],
      ['Bottom line', 'Who would you recommend this faculty to, and why?'],
    ].map(([label, text]) => <button type="button" key={label} onClick={() => setPrompt(text)}>{label}</button>)}</div><label className="field-label" htmlFor="review-comment">Your experience <small>(optional)</small></label><textarea id="review-comment" rows={5} maxLength={800} value={comment} onChange={e => setComment(e.target.value)} placeholder={prompt} /><small className="muted">{comment.length}/800 · If you write a note, use at least 20 characters. Please avoid names or personal details about students.</small></section>
    <details className="panel optional-ratings" open={Boolean(existing?.teaching || existing?.grading || existing?.workload || existing?.lab_ease)}><summary><b>Add detail with ratings</b> <span>Optional · about 20 seconds</span></summary><p className="muted">Only rate what you experienced. Lab ease is for lab classes; workload means time and effort, not quality.</p>{questions.map(q => <fieldset key={q.key}><legend>{q.label} <small>(optional)</small></legend><Scale name={q.key} value={ratings[q.key]} onChange={n => setRatings(current => ({ ...current, [q.key]: n }))} low={q.low} high={q.high} /></fieldset>)}<fieldset><legend>Would you take this faculty again? <small>(optional)</small></legend><div className="choice-options"><label><input type="radio" name="again" checked={again === true} onChange={() => setAgain(true)} /> Yes</label><label><input type="radio" name="again" checked={again === false} onChange={() => setAgain(false)} /> No</label></div></fieldset></details>
    <section className="panel"><label className="attestation"><input type="checkbox" checked={attested} onChange={e => setAttested(e.target.checked)} required /><span>I studied under this faculty. This is my own experience.</span></label><p className="muted">This is self-attested, not enrollment-verified. One review per faculty; you can edit yours later. Reviews are checked before publication.</p>{error && <p role="alert" className="form-error">{error}</p>}<div className="review-actions"><button className="primary-link" disabled={busy || !attested}>{busy ? 'Saving…' : existing ? 'Save changes' : 'Submit anonymous review'}</button>{existing && <button type="button" className="text-link" disabled={busy} onClick={remove}>Delete my review</button>}</div></section>
  </form>;
}

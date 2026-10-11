'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { minimumReviewLength } from '@/lib/review-input';

type Existing = {
  course_code: string | null;
  overall: number;
  teaching: number;
  grading: number;
  workload: number;
  lab_ease: number | null;
  would_take_again: boolean;
  comment: string;
  status: string;
};

const coreQuestions = [
  { key: 'teaching', label: 'Teaching clarity', low: 'Hard to follow', high: 'Very clear' },
  { key: 'grading', label: 'Grading generosity', low: 'Strict', high: 'Generous' },
  { key: 'workload', label: 'Workload', low: 'Light', high: 'Heavy' },
] as const;
type CoreKey = typeof coreQuestions[number]['key'];
type CoreRatings = Record<CoreKey, number | null>;

function Scale({ name, value, onChange, low, high }: {
  name: string;
  value: number | null;
  onChange: (score: number) => void;
  low: string;
  high: string;
}) {
  return <div className="scale">
    <small>{low}</small>
    <div className="rating-options">
      {[1, 2, 3, 4, 5].map(score => <label key={score}>
        <input type="radio" name={name} checked={value === score} onChange={() => onChange(score)} />
        <span>{score}</span>
      </label>)}
    </div>
    <small>{high}</small>
  </div>;
}

export function ReviewForm({ facultyId, courses, existing }: {
  facultyId: string;
  courses: { code: string; title: string }[];
  existing?: Existing;
}) {
  const router = useRouter();
  const [overall, setOverall] = useState<number | null>(existing?.overall ?? null);
  const [ratings, setRatings] = useState<CoreRatings>({
    teaching: existing?.teaching ?? null,
    grading: existing?.grading ?? null,
    workload: existing?.workload ?? null,
  });
  const [hadLab, setHadLab] = useState(existing?.lab_ease !== null && existing?.lab_ease !== undefined);
  const [labEase, setLabEase] = useState<number | null>(existing?.lab_ease ?? null);
  const [courseCode, setCourseCode] = useState(existing?.course_code ?? '');
  const [again, setAgain] = useState<boolean | null>(existing?.would_take_again ?? null);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [prompt, setPrompt] = useState('What mattered most about their teaching, checking and workload? What is your bottom line?');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    if (overall === null || Object.values(ratings).some(value => value === null)) {
      setError('Choose an overall, teaching, grading and workload rating.');
      return;
    }
    if (again === null) { setError('Tell us whether you would take this faculty again.'); return; }
    if (hadLab && labEase === null) { setError('Rate lab ease, or uncheck the lab question.'); return; }
    if (Array.from(comment.trim()).length < minimumReviewLength) {
      setError(`Write at least ${minimumReviewLength} characters about your experience and bottom line. A couple of sentences is enough.`);
      return;
    }
    if (!attested) { setError('Confirm that you studied under this faculty.'); return; }
    setBusy(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          facultyId, courseCode, overall, ...ratings,
          labEase: hadLab ? labEase : null,
          wouldTakeAgain: again, comment, studiedUnderFaculty: attested,
        }),
      });
      const result = await response.json();
      if (!response.ok) { setError(result.error ?? 'Could not save your review.'); return; }
      setDone(true);
    } catch { setError('Connection lost. Your review was not saved. Try again.'); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!window.confirm('Delete your review permanently? This also removes it from public scores.')) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/reviews?facultyId=${encodeURIComponent(facultyId)}`, { method: 'DELETE' });
      if (!response.ok) { setError('Could not delete your review. Please try again.'); return; }
      router.push('/contribute');
      router.refresh();
    } catch { setError('Connection lost. Please try again.'); }
    finally { setBusy(false); }
  }

  if (done) return <section className="panel review-success">
    <span className="eyebrow">SAVED</span>
    <h2>One useful experience shared.</h2>
    <p>Your detailed review is saved and waiting for moderation. It will appear anonymously after approval.</p>
    <Link className="primary-link" href="/contribute">Choose the next of your three faculty →</Link>
  </section>;

  return <form className="review-form" onSubmit={submit}>
    {existing && <div className="context-note">You are editing your {existing.status} review. Saving sends it back for moderation.</div>}
    <section className="panel">
      <span className="eyebrow">YOUR EXPERIENCE</span>
      <h2>Rate what you experienced</h2>
      <p className="muted">Four quick ratings. Workload means time and effort, not whether teaching was good.</p>
      <fieldset><legend>Overall experience</legend><Scale name="overall" value={overall} onChange={setOverall} low="Poor" high="Excellent" /></fieldset>
      {coreQuestions.map(question => <fieldset key={question.key}>
        <legend>{question.label}</legend>
        <Scale
          name={question.key}
          value={ratings[question.key]}
          onChange={score => setRatings(current => ({ ...current, [question.key]: score }))}
          low={question.low}
          high={question.high}
        />
      </fieldset>)}
      <fieldset>
        <legend>Would you take this faculty again?</legend>
        <div className="choice-options">
          <label><input type="radio" name="again" checked={again === true} onChange={() => setAgain(true)} /> Yes</label>
          <label><input type="radio" name="again" checked={again === false} onChange={() => setAgain(false)} /> No</label>
        </div>
      </fieldset>
      <label className="field-label">Course <small>(if you remember it)</small>
        <select value={courseCode} onChange={event => setCourseCode(event.target.value)}>
          <option value="">I’ll skip the course</option>
          {courses.map(course => <option key={course.code} value={course.code}>{course.code} · {course.title}</option>)}
        </select>
      </label>
      <label className="attestation lab-question"><input type="checkbox" checked={hadLab} onChange={event => setHadLab(event.target.checked)} /><span>I also had a lab with this faculty</span></label>
      {hadLab && <fieldset><legend>Lab ease</legend><p className="muted">Consider submissions, record checks, vivas and how demanding the lab felt.</p><Scale name="labEase" value={labEase} onChange={setLabEase} low="Demanding" high="Relaxed" /></fieldset>}
    </section>
    <section className="panel">
      <span className="eyebrow">IN YOUR WORDS</span>
      <h2>What should the next student know?</h2>
      <p className="muted">Two or three honest sentences are enough. Explain the scores that matter and finish with who you would recommend this faculty to.</p>
      <div className="prompt-chips" aria-label="Writing ideas">{[
        ['Teaching', 'How clearly did they teach? What helped or confused you?'],
        ['Grading', 'How fair or generous was checking?'],
        ['Workload', 'How much work did the course need?'],
        ['Labs', 'If you had a lab, how were submissions, vivas or records?'],
        ['Bottom line', 'Who would you recommend this faculty to, and why?'],
      ].map(([label, text]) => <button type="button" key={label} onClick={() => setPrompt(text)}>{label}</button>)}</div>
      <label className="field-label" htmlFor="review-comment">Your written review</label>
      <textarea id="review-comment" rows={5} maxLength={800} value={comment} onChange={event => setComment(event.target.value)} placeholder={prompt} />
      <small className="muted">{Array.from(comment.trim()).length} characters · minimum {minimumReviewLength}, maximum 800. Avoid personal details about students.</small>
    </section>
    <section className="panel">
      <label className="attestation"><input type="checkbox" checked={attested} onChange={event => setAttested(event.target.checked)} /><span>I studied under this faculty. This is my own experience.</span></label>
      <p className="muted">This is self-attested, not enrollment-verified. One review per faculty; you can edit yours later. Reviews are checked before publication.</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="review-actions">
        <button className="primary-link" disabled={busy}>{busy ? 'Saving…' : existing ? 'Save changes' : 'Submit anonymous review'}</button>
        {existing && <button type="button" className="text-link" disabled={busy} onClick={remove}>Delete my review</button>}
      </div>
    </section>
  </form>;
}

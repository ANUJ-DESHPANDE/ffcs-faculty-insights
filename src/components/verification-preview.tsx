'use client';
import { useMemo, useState } from 'react';
import { courses, faculty } from '@/lib/catalog';

export function VerificationPreview() {
  const [input, setInput] = useState('');
  const candidates = useMemo(() => {
    const lines = input.slice(0, 10000).split(/\r?\n/).slice(0, 100);
    const found: { course: string; faculty: string }[] = [];
    for (const line of lines) {
      const upper = line.toUpperCase();
      const course = courses.find(item => new RegExp(`\\b${item.code}\\b`, 'i').test(line));
      if (!course) continue;
      const person = faculty.find(item => item.name.length >= 8 && upper.includes(item.name.toUpperCase()));
      if (person && !found.some(row => row.course === course.code && row.faculty === person.name))
        found.push({ course: course.code, faculty: person.name });
    }
    return found;
  }, [input]);
  return <section className="panel verification-preview"><h2>Local match preview</h2><p className="muted">If you already have a timetable line copied from your own account, paste a redacted line containing a course code and faculty name. The preview is only a candidate match against our historical directory.</p><label htmlFor="timetable-text">Redacted timetable text</label><textarea id="timetable-text" value={input} onChange={e => setInput(e.target.value)} maxLength={10000} rows={7} placeholder="Example format: BCSE302L  |  Faculty name" /><button type="button" onClick={() => setInput('')}>Clear text</button><h3>Candidate matches</h3>{candidates.length ? <ul>{candidates.map(row => <li key={`${row.course}-${row.faculty}`}>{row.course} · {row.faculty}</li>)}</ul> : <p className="muted">No matching course and faculty on the same line yet.</p>}<p className="muted">This preview has no upload, identity check or verified badge. We need to inspect a real VTOP export or screen with informed student consent before building a production parser.</p></section>;
}

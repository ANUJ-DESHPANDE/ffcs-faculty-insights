'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { faculty, facultyById, matchesSearch } from '@/lib/catalog';
import { useReputations } from './reputation-provider';

const studiedKey = 'ffcs-studied-faculty-this-tab';
type Contribution = { faculty_id: string; status: string };

export function FacultyPicker() {
  const reputation = useReputations();
  const [query, setQuery] = useState('');
  const [studied, setStudied] = useState<string[]>([]);
  const [contributions, setContributions] = useState<Contribution[] | null>(null);
  const [progressMessage, setProgressMessage] = useState('');

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem(studiedKey) ?? '[]');
        if (Array.isArray(saved)) setStudied(saved.filter((id): id is string => typeof id === 'string' && facultyById.has(id)).slice(0, 20));
      } catch { /* A corrupt local list should not block contribution. */ }
    }, 0);
    fetch('/api/my-contributions', { cache: 'no-store' }).then(async response => {
      if (response.status === 401) { setProgressMessage('Sign in to save reviews and track your progress.'); return; }
      if (!response.ok) { setProgressMessage('Progress will appear once review collection is connected.'); return; }
      const rows = await response.json();
      if (Array.isArray(rows)) setContributions(rows);
    }).catch(() => setProgressMessage('Progress is temporarily unavailable.'));
    return () => window.clearTimeout(restore);
  }, []);

  const matches = useMemo(() => query.trim().length >= 2
    ? faculty.filter(person => matchesSearch(query, person.name)).slice(0, 12)
    : [], [query]);
  const completed = new Set(contributions?.map(row => row.faculty_id) ?? []);
  const savedCount = completed.size;
  const remaining = Math.max(3 - savedCount, 0);
  const ranked = studied.filter(id => !completed.has(id)).sort((left, right) =>
    reputation(left).count - reputation(right).count ||
    (facultyById.get(left)?.name ?? '').localeCompare(facultyById.get(right)?.name ?? ''),
  );
  const recommended = ranked.slice(0, remaining);

  function updateStudied(next: string[]) {
    setStudied(next);
    sessionStorage.setItem(studiedKey, JSON.stringify(next));
  }

  return <div className="mission-layout">
    <section className="panel review-mission">
      <span className="eyebrow">YOUR CONTRIBUTION</span>
      <h2>Three detailed reviews</h2>
      <p className="muted">Choose faculty you actually studied under. From your list, we put those with the fewest published reviews first. Your choices stay in this browser tab.</p>
      {contributions ? <div className="mission-progress"><strong>{Math.min(savedCount, 3)} / 3</strong><span>detailed reviews saved</span><progress max={3} value={Math.min(savedCount, 3)} /></div> : <p className="muted">{progressMessage || 'Loading your progress…'}</p>}
      {savedCount >= 3 && <p className="mission-done">You reached the three-review goal. Thank you for helping fill gaps.</p>}
      {recommended.length > 0 && <><h3>Review these first</h3><div className="mission-candidates">{recommended.map(id => {
        const person = facultyById.get(id)!;
        const count = reputation(id).count;
        return <div key={id}><span><b>{person.name}</b><small>{count ? `${count} published ${count === 1 ? 'review' : 'reviews'}` : 'No published reviews yet'}</small></span><Link href={`/review/${id}`}>Write review →</Link></div>;
      })}</div></>}
      {ranked.length > recommended.length && <p className="muted">You have {ranked.length - recommended.length} other selected faculty. Finish the three most needed first.</p>}
      {studied.length > 0 && <div className="studied-list"><b>Your studied list</b>{studied.map(id => {
        const person = facultyById.get(id)!;
        return <div key={id}><span>{person.name}{completed.has(id) && <small> · Review saved</small>}</span><button type="button" onClick={() => updateStudied(studied.filter(value => value !== id))}>Remove</button></div>;
      })}</div>}
    </section>
    <section className="panel faculty-picker">
      <label htmlFor="faculty-search">Add faculty you studied under</label>
      <input id="faculty-search" autoComplete="off" value={query} onChange={event => setQuery(event.target.value)} placeholder="Type a faculty name" />
      <p className="muted">Add everyone you remember, then review the three with least coverage. If you studied under fewer than three, review only those you know.</p>
      {matches.length > 0 && <div className="picker-results">{matches.map(person => {
        const chosen = studied.includes(person.id);
        const count = reputation(person.id).count;
        return <div key={person.id}><span>{person.name}<small>{count ? `${count} published reviews` : 'No reviews yet'}</small></span><button type="button" disabled={chosen || studied.length >= 20} onClick={() => updateStudied([...studied, person.id])}>{chosen ? 'Added' : 'Add'}</button></div>;
      })}</div>}
      {query.trim().length >= 2 && !matches.length && <p>No match in this historical directory. Try another spelling.</p>}
    </section>
  </div>;
}

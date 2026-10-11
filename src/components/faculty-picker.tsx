'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { faculty, matchesSearch } from '@/lib/catalog';
import { useReputations } from './reputation-provider';

export function FacultyPicker() {
  const reputation = useReputations();
  const [query, setQuery] = useState('');
  const matches = useMemo(() => query.trim().length >= 2 ? faculty.filter(person => matchesSearch(query, person.name)).slice(0, 12) : [], [query]);
  return <section className="panel faculty-picker"><label htmlFor="faculty-search">Who did you study under?</label><input id="faculty-search" autoComplete="off" value={query} onChange={e => setQuery(e.target.value)} placeholder="Type a faculty name" /><p className="muted">Search by name. You can review someone even if their course is not in the historical archive. A useful first review helps especially much.</p>{matches.length > 0 && <div className="picker-results">{matches.map(person => <Link key={person.id} href={`/review/${person.id}`}><span>{person.name}<small>{reputation(person.id).count ? `${reputation(person.id).count} published reviews` : 'No reviews yet · yours could be the first'}</small></span><b>Review →</b></Link>)}</div>}{query.trim().length >= 2 && !matches.length && <p>No match in this archive. Try another spelling.</p>}</section>;
}

'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { reputationFrom, type Reputation, type SummaryRow } from '@/lib/reputation';

const Context = createContext<Record<string, SummaryRow>>({});
export function ReputationProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRows] = useState<Record<string, SummaryRow>>({});
  useEffect(() => {
    let active = true;
    fetch('/api/reputation', { cache: 'no-store' }).then(response => response.ok ? response.json() : []).then((data: SummaryRow[]) => {
      if (active && Array.isArray(data)) setRows(Object.fromEntries(data.map(row => [row.faculty_id, row])));
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  return <Context.Provider value={rows}>{children}</Context.Provider>;
}
export function useReputation(id: string): Reputation { return reputationFrom(useContext(Context)[id]); }
export function useReputations() { const rows = useContext(Context); return (id: string) => reputationFrom(rows[id]); }

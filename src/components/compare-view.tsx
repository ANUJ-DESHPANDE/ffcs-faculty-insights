"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  facultyById,
  offeringsForFaculty,
  reputation,
  scoreLabel,
} from "@/lib/catalog";
import { getShortlist } from "./shortlist-button";

export function CompareView() {
  const [saved, setSaved] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => {
      const next = getShortlist();
      setSaved(next);
      setSelected((current) =>
        current.length
          ? current.filter((id) => next.includes(id))
          : next.slice(0, 4),
      );
    };
    sync();
    window.addEventListener("shortlist-change", sync);
    return () => window.removeEventListener("shortlist-change", sync);
  }, []);
  const items = selected
    .map((id) => facultyById.get(id))
    .filter((item) => !!item);
  const metrics = [
    ["Overall", (id: string) => scoreLabel(reputation(id).overall)],
    ["Ratings", (id: string) => String(reputation(id).count)],
    ["Evidence", (id: string) => reputation(id).confidence],
    ["Teaching quality", (id: string) => scoreLabel(reputation(id).teaching)],
    [
      "Grading generosity ↑",
      (id: string) => scoreLabel(reputation(id).grading),
    ],
    [
      "Attendance strictness ↑",
      (id: string) => scoreLabel(reputation(id).attendance),
    ],
    ["Workload ↑", (id: string) => scoreLabel(reputation(id).workload)],
    [
      "Would take again",
      (id: string) =>
        reputation(id).again === null ? "—" : `${reputation(id).again}%`,
    ],
    [
      "Known courses",
      (id: string) =>
        String(new Set(offeringsForFaculty(id).map((o) => o.courseCode)).size),
    ],
  ] as const;
  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : current.length < 4
          ? [...current, id]
          : current,
    );
  }
  return (
    <main className="page-wrap">
      <div className="page-intro">
        <span className="eyebrow">DECISION WORKSPACE</span>
        <h1>Compare faculty.</h1>
        <p>
          Put up to four saved faculty side by side. Every score is paired with
          its sample size.
        </p>
      </div>
      {saved.length ? (
        <>
          <div className="compare-picker">
            <strong>Choose up to four</strong>
            <div>
              {saved.map((id) => {
                const item = facultyById.get(id);
                return (
                  item && (
                    <button
                      key={id}
                      className={selected.includes(id) ? "active" : ""}
                      onClick={() => toggle(id)}
                      aria-pressed={selected.includes(id)}
                    >
                      {item.name}
                    </button>
                  )
                );
              })}
            </div>
          </div>
          {items.length ? (
            <div className="compare-scroll">
              <div
                className="compare-table"
                style={{
                  gridTemplateColumns: `minmax(160px, 1fr) repeat(${items.length}, minmax(180px, 1.15fr))`,
                }}
              >
                <div className="compare-cell heading">Faculty</div>
                {items.map((item) => (
                  <div className="compare-cell heading" key={item.id}>
                    <Link href={`/faculty/${item.id}`}>{item.name} ↗</Link>
                    <small>
                      {item.demo ? "Simulated data" : "Public archive only"}
                    </small>
                  </div>
                ))}
                {metrics.map(([label, getValue]) => (
                  <div className="compare-row" key={label}>
                    <div className="compare-cell row-label">{label}</div>
                    {items.map((item) => (
                      <div className="compare-cell" key={item.id}>
                        {getValue(item.id)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">Select a faculty above to begin.</div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <h2>Save a few faculty first.</h2>
          <p>Your shortlist supplies the options for comparison.</p>
          <Link className="primary-link" href="/faculty">
            Browse faculty ↗
          </Link>
        </div>
      )}
    </main>
  );
}

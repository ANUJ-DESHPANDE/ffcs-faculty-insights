"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  facultyById,
  offeringsForFaculty,
  reputation,
  scoreLabel,
} from "@/lib/catalog";
import { getShortlist, ShortlistButton } from "./shortlist-button";

export function ShortlistView() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(getShortlist());
    sync();
    window.addEventListener("shortlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("shortlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const items = ids.map((id) => facultyById.get(id)).filter((item) => !!item);
  return (
    <main className="page-wrap">
      <div className="page-intro">
        <span className="eyebrow">YOUR WORKSPACE</span>
        <h1>My shortlist.</h1>
        <p>
          Keep the faculty you are considering in one place. Saved only in this
          browser.
        </p>
      </div>
      {items.length ? (
        <>
          <div className="results-header">
            <strong>{items.length} saved faculty</strong>
            <Link href="/compare">Compare saved faculty ↗</Link>
          </div>
          <div className="shortlist-grid">
            {items.map((item) => {
              const rep = reputation(item.id);
              const courseCodes = [
                ...new Set(
                  offeringsForFaculty(item.id).map((o) => o.courseCode),
                ),
              ];
              return (
                <article className="shortlist-item" key={item.id}>
                  <div>
                    <span className="eyebrow">
                      {item.demo
                        ? "PRODUCT DEMO"
                        : `${courseCodes.length} KNOWN COURSES`}
                    </span>
                    <h2>
                      <Link href={`/faculty/${item.id}`}>{item.name}</Link>
                    </h2>
                    <p>
                      {rep.count
                        ? `${scoreLabel(rep.overall)} overall · ${rep.count} simulated ratings`
                        : "No ratings yet"}
                    </p>
                    <small>
                      {courseCodes.slice(0, 5).join(" · ") ||
                        "No course history"}
                    </small>
                  </div>
                  <ShortlistButton id={item.id} compact />
                </article>
              );
            })}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <h2>Your shortlist is empty.</h2>
          <p>
            Save faculty from a course page or profile. They will appear here
            for quick comparison.
          </p>
          <Link className="primary-link" href="/courses">
            Find a course ↗
          </Link>
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import {
  scoreLabel,
  type Faculty,
  type Offering,
} from "@/lib/catalog";
import { ShortlistButton } from "./shortlist-button";
import { useReputation } from './reputation-provider';

export function FacultyCard({
  item,
  offering,
}: {
  item: Faculty;
  offering?: Offering;
}) {
  const rep = useReputation(item.id);
  return (
    <article className="faculty-card">
      <div className="faculty-card-main">
        <div>
          <div className="eyebrow">
            FACULTY
          </div>
          <h3>
            <Link href={`/faculty/${item.id}`}>{item.name}</Link>
          </h3>
          <p className="muted">
            {offering
              ? `${offering.slot} · ${offering.venue || "Venue unknown"} · ${offering.school}`
              : "View profile and known courses"}
          </p>
        </div>
        <div className="card-actions">
          <ShortlistButton id={item.id} compact />
          <Link className="text-link" href={`/faculty/${item.id}`}>
            Details ↗
          </Link>
        </div>
      </div>
      <div className="metric-row">
        <div>
          <strong>{scoreLabel(rep.overall)}</strong>
          <span>Overall</span>
        </div>
        <div>
          <strong>{rep.count}</strong>
          <span>{rep.count === 1 ? "Rating" : "Ratings"}</span>
        </div>
        <div>
          <strong>{scoreLabel(rep.teaching)}</strong>
          <span>Teaching</span>
        </div>
        <div>
          <strong>{scoreLabel(rep.grading)}</strong>
          <span>Grading ↑</span>
        </div>
        <div>
          <strong>{scoreLabel(rep.labEase)}</strong>
          <span>Lab ease ↑</span>
        </div>
        <div>
          <strong>{scoreLabel(rep.workload)}</strong>
          <span>Workload ↑</span>
        </div>
      </div>
      <p className="evidence">
        {rep.confidence}
        {rep.count ? ` · ${rep.count} published ratings` : ' · No published ratings yet'}
      </p>
    </article>
  );
}

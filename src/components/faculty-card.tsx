import Link from "next/link";
import {
  reputation,
  scoreLabel,
  type Faculty,
  type Offering,
} from "@/lib/catalog";
import { ShortlistButton } from "./shortlist-button";

export function FacultyCard({
  item,
  offering,
}: {
  item: Faculty;
  offering?: Offering;
}) {
  const rep = reputation(item.id);
  return (
    <article className="faculty-card">
      <div className="faculty-card-main">
        <div>
          <div className="eyebrow">
            {item.demo ? "SIMULATED PROFILE" : "FACULTY"}
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
          <strong>{scoreLabel(rep.attendance)}</strong>
          <span>Attendance ↑</span>
        </div>
        <div>
          <strong>{scoreLabel(rep.workload)}</strong>
          <span>Workload ↑</span>
        </div>
      </div>
      <p className="evidence">
        {rep.confidence}
        {item.demo
          ? " · simulated ratings"
          : " · no student ratings collected yet"}
      </p>
    </article>
  );
}

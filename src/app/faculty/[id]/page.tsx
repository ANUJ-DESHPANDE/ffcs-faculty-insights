import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShortlistButton } from "@/components/shortlist-button";
import {
  courseByCode,
  facultyById,
  offeringsForFaculty,
  reputation,
  scoreLabel,
} from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = facultyById.get(id);
  return {
    title: item ? item.name : "Faculty",
    description: item
      ? `Known courses and evidence for ${item.name}. Historical offerings are not current FFCS availability.`
      : undefined,
  };
}
export default async function FacultyProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = facultyById.get(id);
  if (!item) notFound();
  const rows = offeringsForFaculty(id);
  const rep = reputation(id);
  const uniqueCourses = [...new Set(rows.map((row) => row.courseCode))];
  return (
    <main className="page-wrap">
      <div className="breadcrumbs">
        <Link href="/faculty">Faculty</Link> / {item.name}
      </div>
      <div className="profile-head">
        <div>
          <span className="eyebrow">
            {item.demo ? "FICTIONAL PRODUCT DEMO" : "FACULTY PROFILE"}
          </span>
          <h1>{item.name}</h1>
          <p>
            {item.demo
              ? "All information below is simulated."
              : `${uniqueCourses.length} known courses in the June 2026 public archive`}
          </p>
        </div>
        <ShortlistButton id={id} />
      </div>
      <div className="profile-layout">
        <div>
          <section className="panel">
            <span className="eyebrow">REPUTATION</span>
            <div className="reputation-head">
              <strong>
                {scoreLabel(rep.overall)}
                <small>{rep.overall === null ? "" : " / 5"}</small>
              </strong>
              <div>
                <b>
                  {rep.count} {rep.count === 1 ? "rating" : "ratings"}
                </b>
                <span>{rep.confidence}</span>
              </div>
            </div>
            <p className="muted">
              {item.demo
                ? "Simulated student ratings for interface testing."
                : "No real student ratings have been collected yet. We do not fabricate reputation scores."}
            </p>
            <div className="detail-metrics">
              {[
                ["Teaching quality", rep.teaching, "Higher is better"],
                ["Grading generosity", rep.grading, "Higher is more generous"],
                ["Attendance strictness", rep.attendance, "Higher is stricter"],
                ["Workload", rep.workload, "Higher is heavier"],
              ].map(([label, value, hint]) => (
                <div key={label as string}>
                  <span>
                    {label}
                    <small>{hint}</small>
                  </span>
                  <strong>{scoreLabel(value as number | null)}</strong>
                </div>
              ))}
            </div>
            <div className="again">
              <span>Would take again</span>
              <strong>{rep.again === null ? "—" : `${rep.again}%`}</strong>
            </div>
          </section>
          <section className="panel">
            <span className="eyebrow">ANONYMOUS REVIEWS</span>
            <h2>Student experiences</h2>
            {item.demo ? (
              <p className="muted">
                This demo has simulated rating data only. No comments or student
                identities are fabricated.
              </p>
            ) : (
              <p className="muted">
                No reviews yet. Future public reviews will be anonymous, even
                when account ownership is used privately to prevent duplicates.
              </p>
            )}
            <Link
              className="text-link"
              href={`/contribute?faculty=${encodeURIComponent(id)}`}
            >
              See contribution flow ↗
            </Link>
          </section>
        </div>
        <div>
          <section className="panel">
            <span className="eyebrow">COURSE HISTORY</span>
            <h2>Known courses</h2>
            <p className="muted">
              Source rows from one dated snapshot. Repeat rows may reflect
              school categories or sections.
            </p>
            <div className="course-history">
              {uniqueCourses.map((code) => {
                const course = courseByCode.get(code);
                return (
                  <Link key={code} href={`/courses/${code}`}>
                    <code>{code}</code>
                    <span>{course?.title || code}</span>
                    <b>↗</b>
                  </Link>
                );
              })}
            </div>
          </section>
          <section className="panel">
            <span className="eyebrow">SLOT HISTORY</span>
            <h2>{item.demo ? "Simulated offerings" : "Archived offerings"}</h2>
            <div className="offering-table">
              {rows.slice(0, 30).map((row) => (
                <div key={row.id}>
                  <Link href={`/courses/${row.courseCode}`}>
                    {row.courseCode}
                  </Link>
                  <strong>{row.slot || "—"}</strong>
                  <span>{row.venue || "—"}</span>
                </div>
              ))}
            </div>
            {rows.length > 30 && (
              <p className="muted">Showing 30 of {rows.length} rows.</p>
            )}
          </section>
          <section className="panel">
            <span className="eyebrow">GRADE EVIDENCE</span>
            <h2>No grade curves yet</h2>
            <p className="muted">
              A curve must come from a specific faculty, course and class
              offering. We will never infer grading behavior from unsupported
              averages.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

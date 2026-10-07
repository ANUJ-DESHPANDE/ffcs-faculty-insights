import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseOptions } from "@/components/course-options";
import { courseByCode, offeringsForCourse } from "@/lib/catalog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const course = courseByCode.get(code.toUpperCase());
  return {
    title: course ? `${course.code} ${course.title}` : "Course",
    description: course
      ? `Explore archived faculty and slot options for ${course.title}. Historical data; current availability unconfirmed.`
      : undefined,
  };
}
export default async function CoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const course = courseByCode.get(code.toUpperCase());
  if (!course) notFound();
  const rows = offeringsForCourse(course.code);
  return (
    <main className="page-wrap">
      <div className="breadcrumbs">
        <Link href="/courses">Courses</Link> / {course.code}
      </div>
      <section className="detail-hero">
        <div>
          <span className="eyebrow">
            {course.demo
              ? "FICTIONAL PRODUCT DEMO"
              : `${course.type.toUpperCase()} · HISTORICAL ARCHIVE`}
          </span>
          <h1>{course.title}</h1>
          <p>
            <code>{course.code}</code> · {rows.length}{" "}
            {course.demo ? "simulated options" : "archived offering rows"}
          </p>
        </div>
      </section>
      <div className="context-note">
        <strong>{course.demo ? "Demo data" : "Historical source data"}</strong>
        <p>
          {course.demo
            ? "All faculty, slots and ratings on this page are fictional examples for exploring the interface."
            : "These offerings came from a June 2026 FFCS-inator snapshot. They do not confirm availability in the upcoming FFCS cycle."}
        </p>
      </div>
      <CourseOptions rows={rows} />
    </main>
  );
}

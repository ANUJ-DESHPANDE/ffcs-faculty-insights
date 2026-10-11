"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  courses,
  faculty,
  matchesSearch,
  offerings,
  offeringsForCourse,
  offeringsForFaculty,
} from "@/lib/catalog";
import { useReputations } from './reputation-provider';
import { ShortlistButton } from "./shortlist-button";

export function Browse({ kind }: { kind: "courses" | "faculty" }) {
  const reputation = useReputations();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [school, setSchool] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const schools = useMemo(
    () => [...new Set(offerings.map((o) => o.school))].sort(),
    [],
  );
  const results = useMemo(
    () =>
      kind === "courses"
        ? courses
            .filter(
              (course) =>
                matchesSearch(query, course.code, course.title) ||
                (query &&
                  offeringsForCourse(course.code).some((o) =>
                    matchesSearch(
                      query,
                      faculty.find((f) => f.id === o.facultyId)?.name || "",
                    ),
                  )),
            )
            .filter(
              (course) =>
                school === "all" ||
                offeringsForCourse(course.code).some(
                  (o) => o.school === school,
                ),
            )
        : faculty
            .filter((item) => matchesSearch(query, item.name))
            .filter(
              (item) =>
                school === "all" ||
                offeringsForFaculty(item.id).some((o) => o.school === school),
            ),
    [kind, query, school],
  );
  const visible = showAll ? results : results.slice(0, 48);
  return (
    <main className="page-wrap">
      <div className="page-intro">
        <span className="eyebrow">DISCOVER / {kind.toUpperCase()}</span>
        <h1>
          {kind === "courses" ? "Find your course." : "Find your faculty."}
        </h1>
        <p>
          {kind === "courses"
            ? "Search by code, title, or a faculty name. Open a course to inspect the archived slot options."
            : "Explore faculty profiles and known course associations from the public archive."}
        </p>
      </div>
      <div className="browse-tools">
        <label className="search-field">
          Search {kind}
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAll(false);
            }}
            placeholder={
              kind === "courses"
                ? "BCSE302L or Database Systems"
                : "Faculty name"
            }
          />
        </label>
        <label>
          School / source group
          <select
            value={school}
            onChange={(event) => {
              setSchool(event.target.value);
              setShowAll(false);
            }}
          >
            <option value="all">All schools</option>
            {schools.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="results-header">
        <strong>
          {results.length} {kind} found
        </strong>
        <span>Historical snapshot · no current availability claim</span>
      </div>
      {results.length ? (
        <div className="browse-grid">
          {kind === "courses"
            ? visible.map((value) => {
                const item = value as (typeof courses)[number];
                const count = offeringsForCourse(item.code).length;
                return (
                  <Link
                    className="browse-tile"
                    href={`/courses/${item.code}`}
                    key={item.code}
                  >
                    <span className="eyebrow">
                      {item.type}
                    </span>
                    <h2>{item.title}</h2>
                    <div>
                      <code>{item.code}</code>
                      <span>
                        {count} archived options
                        ↗
                      </span>
                    </div>
                  </Link>
                );
              })
            : visible.map((value) => {
                const item = value as (typeof faculty)[number];
                const rep = reputation(item.id);
                return (
                  <div className="browse-tile" key={item.id}>
                    <span className="eyebrow">
                      {offeringsForFaculty(item.id).length} KNOWN OFFERINGS
                    </span>
                    <h2>
                      <Link href={`/faculty/${item.id}`}>{item.name}</Link>
                    </h2>
                    <div>
                      <span>
                        {rep.count
                          ? `${rep.count} published ratings`
                          : "No published ratings yet"}
                      </span>
                      <ShortlistButton id={item.id} compact />
                    </div>
                  </div>
                );
              })}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No matches yet.</h2>
          <p>Try a shorter name or code, or remove the school filter.</p>
          <button
            onClick={() => {
              setQuery("");
              setSchool("all");
            }}
          >
            Clear filters
          </button>
        </div>
      )}
      {!showAll && results.length > 48 && (
        <button className="load-more" onClick={() => setShowAll(true)}>
          Show all {results.length} results
        </button>
      )}
    </main>
  );
}

"use client";
import { useMemo, useState } from "react";
import { facultyById, reputation, type Offering } from "@/lib/catalog";
import { FacultyCard } from "./faculty-card";

export function CourseOptions({ rows }: { rows: Offering[] }) {
  const [slot, setSlot] = useState("all");
  const [sort, setSort] = useState("name");
  const slots = useMemo(
    () => [...new Set(rows.map((row) => row.slot).filter(Boolean))].sort(),
    [rows],
  );
  const visible = useMemo(
    () =>
      rows
        .filter((row) => slot === "all" || row.slot === slot)
        .sort((a, b) => {
          if (sort === "rating")
            return (
              (reputation(b.facultyId).overall ?? -1) -
              (reputation(a.facultyId).overall ?? -1)
            );
          if (sort === "evidence")
            return (
              reputation(b.facultyId).count - reputation(a.facultyId).count
            );
          return (facultyById.get(a.facultyId)?.name || "").localeCompare(
            facultyById.get(b.facultyId)?.name || "",
          );
        }),
    [rows, slot, sort],
  );
  return (
    <section className="options-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FACULTY OPTIONS</span>
          <h2>
            {visible.length}{" "}
            {slot === "all" ? "known offerings" : `offerings in ${slot}`}
          </h2>
        </div>
      </div>
      <div className="filter-bar">
        <label>
          Slot
          <select
            value={slot}
            onChange={(event) => setSlot(event.target.value)}
          >
            <option value="all">All slots</option>
            {slots.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="name">Faculty name</option>
            <option value="rating">Overall rating</option>
            <option value="evidence">Most ratings</option>
          </select>
        </label>
      </div>
      <div className="faculty-list">
        {visible.map((row) => {
          const item = facultyById.get(row.facultyId);
          return (
            item && <FacultyCard key={row.id} item={item} offering={row} />
          );
        })}
      </div>
      {!visible.length && (
        <p className="empty-state">No options in this slot.</p>
      )}
    </section>
  );
}

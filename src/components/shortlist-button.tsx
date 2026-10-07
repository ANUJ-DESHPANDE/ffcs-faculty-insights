"use client";
import { useEffect, useState } from "react";

const key = "ffcs-shortlist-v1";
export function getShortlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}
export function ShortlistButton({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const sync = () => setSaved(getShortlist().includes(id));
    sync();
    window.addEventListener("shortlist-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("shortlist-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [id]);
  function toggle() {
    const next = new Set(getShortlist());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    localStorage.setItem(key, JSON.stringify([...next]));
    window.dispatchEvent(new Event("shortlist-change"));
  }
  return (
    <button
      className={`save-button ${saved ? "saved" : ""}`}
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={`${saved ? "Remove from" : "Add to"} shortlist`}
    >
      {saved ? "♥" : "♡"}
      {compact ? "" : ` ${saved ? "Saved" : "Shortlist"}`}
    </button>
  );
}

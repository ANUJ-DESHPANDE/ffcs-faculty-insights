"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export function SearchBox() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  return (
    <form
      className="hero-search"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/courses?q=${encodeURIComponent(query)}`);
      }}
      role="search"
    >
      <label htmlFor="home-search">
        Search a course code, title, or faculty
      </label>
      <div>
        <span aria-hidden="true">⌕</span>
        <input
          id="home-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Try BCSE302L, Database Systems, or a faculty name"
        />
        <button type="submit">
          Explore <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}

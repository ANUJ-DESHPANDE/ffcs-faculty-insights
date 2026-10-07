import Link from "next/link";
export default function NotFound() {
  return (
    <main className="page-wrap">
      <div className="empty-state">
        <h1>We could not find that page.</h1>
        <p>The course code or faculty link may be outdated.</p>
        <Link className="primary-link" href="/">
          Back to search ↗
        </Link>
      </div>
    </main>
  );
}

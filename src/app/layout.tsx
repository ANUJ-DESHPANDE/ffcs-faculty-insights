import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ReputationProvider } from '@/components/reputation-provider';
import { AccountLink } from '@/components/account-link';

export const metadata: Metadata = {
  title: {
    default: "FFCS Faculty Insights",
    template: "%s | FFCS Faculty Insights",
  },
  description:
    "Explore faculty, course offerings and evidence for VIT Vellore FFCS. Independent student project.",
  openGraph: {
    title: "FFCS Faculty Insights",
    description: "Make better FFCS choices with course and faculty discovery.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span className="brand-mark">
                F<span>•</span>
              </span>
              <span>
                Faculty Insights<small>FFCS, with context.</small>
              </span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/courses">Courses</Link>
              <Link href="/faculty">Faculty</Link>
              <Link href="/shortlist">Shortlist</Link>
              <Link href="/compare">Compare</Link>
              <Link href="/contribute">Contribute</Link>
              <AccountLink />
            </nav>
          </header>
          <div className="demo-strip">
            Public offering archive: June 2026 source snapshot. Upcoming FFCS
            availability is not confirmed. Reviews appear only after moderation.
          </div>
          <ReputationProvider>{children}</ReputationProvider>
          <footer>
            <div>
              <strong>Faculty Insights</strong>
              <p>Independent student project. Not affiliated with VIT.</p>
            </div>
            <div>
              <Link href="/about">About & data sources</Link>
              <Link href="/privacy">Privacy</Link>
              <a
                href="https://ffcs.codechefvit.com"
                target="_blank"
                rel="noreferrer"
              >
                Build a timetable with FFCS-inator ↗
              </a>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

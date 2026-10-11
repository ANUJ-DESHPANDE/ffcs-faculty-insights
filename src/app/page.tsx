import Link from "next/link";
import { SearchBox } from "@/components/search-box";
import { courses, faculty, offerings } from "@/lib/catalog";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-kicker">
          <span className="live-dot" /> A clearer way through FFCS
        </div>
        <h1>
          Choose faculty with
          <br />
          <em>more than a name.</em>
        </h1>
        <p>
          See who has taught your course, examine slots, save options, and
          compare what the evidence actually says.
        </p>
        <SearchBox />
        <div className="hero-links">
          <Link href="/courses">Browse courses ↗</Link>
          <Link href="/faculty">Find a faculty member ↗</Link>
        </div>
      </section>
      <section className="stats-band">
        <div>
          <strong>{courses.length}</strong>
          <span>courses in archive</span>
        </div>
        <div>
          <strong>{faculty.length}</strong>
          <span>faculty in archive</span>
        </div>
        <div>
          <strong>{offerings.length}</strong>
          <span>historical offerings</span>
        </div>
        <p>
          Source:{" "}
          <a
            href="https://github.com/CodeChefVIT/ffcs"
            target="_blank"
            rel="noreferrer"
          >
            CodeChef-VIT FFCS-inator ↗
          </a>
          <br />
          June 28, 2026 commit. Availability for the next cycle has not been
          verified.
        </p>
      </section>
      <section className="home-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START WHERE YOU ARE</span>
            <h2>Two ways into the same decision.</h2>
          </div>
        </div>
        <div className="path-grid">
          <Link href="/courses" className="path-card">
            <span className="path-icon">01 /</span>
            <h3>I have a course and slot in mind.</h3>
            <p>
              Start with a course, then narrow known offerings by slot and
              compare faculty.
            </p>
            <strong>Explore courses ↗</strong>
          </Link>
          <Link href="/faculty" className="path-card">
            <span className="path-icon">02 /</span>
            <h3>I have a faculty member in mind.</h3>
            <p>
              Look up their profile, known courses, and any evidence gathered so
              far.
            </p>
            <strong>Explore faculty ↗</strong>
          </Link>
        </div>
      </section>
      <section className="demo-feature">
        <div>
          <span className="eyebrow">SHARE YOUR EXPERIENCE</span>
          <h2>Help someone make a better choice.</h2>
          <p>
            Studied under a faculty member here? Choose three you know, starting
            with those who have fewer reviews. Share a short, detailed account of each.
          </p>
          <Link className="primary-link" href="/contribute">
            Write a review ↗
          </Link>
        </div>
        <div className="demo-preview">
          <span>YOUR EXPERIENCE · ANONYMOUS TO READERS</span>
          <h3>What should the next student know?</h3>
          <div>
            <b>Core ratings</b>
            <b>Written bottom line</b>
          </div>
          <p>Your review is saved privately and published after moderation.</p>
        </div>
      </section>
      <section className="home-section community">
        <span className="eyebrow">BUILT ON SHARED EXPERIENCE</span>
        <h2>Good advice should travel further than a WhatsApp group.</h2>
        <p>
          Faculty knowledge has always moved through seniors and friends. We
          want it to become easier to find, easier to question, and easier to
          pass forward.
        </p>
        <Link href="/about">Why we are building this ↗</Link>
      </section>
    </main>
  );
}

import Link from "next/link";
export default function About() {
  return (
    <main className="page-wrap">
      <div className="page-intro">
        <span className="eyebrow">ABOUT THE PROJECT</span>
        <h1>Campus knowledge, within reach.</h1>
        <p>
          FFCS advice should not depend on knowing the right seniors or being in
          the right groups.
        </p>
      </div>
      <div className="about-copy">
        <h2>Why this exists</h2>
        <p>
          Students already share practical, nuanced advice about faculty. It is
          scattered across chats and memories, so a student with fewer
          connections has less to work with. Faculty Insights is an independent
          student project to make that experience searchable, contextual and
          easy to pass forward.
        </p>
        <h2>What the data says</h2>
        <p>
          Our course and faculty archive is imported from{" "}
          <a
            href="https://github.com/CodeChefVIT/ffcs"
            target="_blank"
            rel="noreferrer"
          >
            CodeChef-VIT’s FFCS-inator
          </a>{" "}
          public repository under its MIT license. The included snapshot is from
          its June 28, 2026 commit. It is historical. It does not establish
          faculty availability for the next FFCS cycle. The separate product
          demo uses fictional faculty and simulated ratings, visibly labeled
          throughout.
        </p>
        <h2>Trust before scores</h2>
        <p>
          One or two ratings should never look like settled reputation. We
          suppress the aggregate score until five ratings and show the number
          behind every metric. Public reviews will be anonymous. Future
          verification, if introduced, will still protect students’ identities.
        </p>
        <h2>Independent and careful</h2>
        <p>
          This site is not officially affiliated with VIT. Student reviews are
          subjective; crowdsourced records can contain errors. We will keep
          historical offerings distinct from confirmed current ones and tie any
          grade curve to a particular class rather than making claims about a
          faculty member from one result.
        </p>
        <Link className="primary-link" href="/courses">
          Explore the archive ↗
        </Link>
      </div>
    </main>
  );
}

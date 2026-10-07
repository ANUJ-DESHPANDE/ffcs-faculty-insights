import Link from "next/link";
import { ReviewPreview } from "@/components/review-preview";
export default function Contribute() {
  return (
    <main className="page-wrap">
      <div className="page-intro">
        <span className="eyebrow">PASS IT FORWARD</span>
        <h1>Help the next student choose.</h1>
        <p>
          A minute of useful context from you can save someone else a dozen
          messages.
        </p>
      </div>
      <div className="context-note">
        <strong>Contribution is not open yet</strong>
        <p>
          Real review submission needs VIT student sign-in, private account
          ownership and abuse controls. This preview shows the questions we plan
          to ask. It does not store or publish answers.
        </p>
      </div>
      <div className="profile-layout">
        <ReviewPreview />
        <div>
          <section className="panel">
            <span className="eyebrow">PLANNED REVIEW FLOW</span>
            <h2>Short, useful, anonymous.</h2>
            <ol className="steps">
              <li>
                <b>Choose your faculty.</b>
                <span>Optionally add the course you took.</span>
              </li>
              <li>
                <b>Rate what matters.</b>
                <span>
                  Teaching, grading generosity, attendance strictness and
                  workload, each with clear direction.
                </span>
              </li>
              <li>
                <b>Add context if useful.</b>
                <span>
                  A comment is optional. Public presentation will say “Anonymous
                  student”.
                </span>
              </li>
              <li>
                <b>Review and submit.</b>
                <span>
                  Your account is kept private to enforce one-person-one-review
                  and support edits.
                </span>
              </li>
            </ol>
          </section>
          <section className="panel">
            <span className="eyebrow">RECIPROCAL ACCESS</span>
            <h2>Give a little. Get a lot back.</h2>
            <p>
              In the full product, students would rate a few faculty they
              actually studied under, prioritizing those with little coverage.
              Contributing would unlock the community’s detailed insights.
            </p>
            <p className="muted">
              Verification may later use a consent-based importer inside the
              student’s own VTOP session. This site will never ask for a VTOP
              password.
            </p>
            <Link className="text-link" href="/about">
              Read the community approach ↗
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}

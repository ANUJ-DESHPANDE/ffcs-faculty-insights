"use client";
import { useState } from "react";

const labels = [
  ["Teaching quality", "1 = poor · 5 = excellent"],
  ["Grading generosity", "1 = strict · 5 = generous"],
  ["Attendance strictness", "1 = lenient · 5 = strict"],
  ["Workload", "1 = light · 5 = heavy"],
] as const;
export function ReviewPreview() {
  const [values, setValues] = useState([3, 3, 3, 3]);
  const [again, setAgain] = useState("yes");
  return (
    <section className="panel preview-form">
      <span className="eyebrow">INTERACTIVE FORM PREVIEW</span>
      <h2>Try a one-minute review</h2>
      <p className="muted">
        This is a local preview using a fictional faculty. Your answers are not
        submitted or saved.
      </p>
      <p>
        <strong>Demo faculty · Ananya Rao</strong>
        <br />
        <small>DEMO302L · Database Systems product demo</small>
      </p>
      {labels.map(([label, hint], index) => (
        <fieldset key={label}>
          <legend>
            {label} <small>{hint}</small>
          </legend>
          <div className="rating-options">
            {[1, 2, 3, 4, 5].map((score) => (
              <label key={score}>
                <input
                  type="radio"
                  name={`rating-${index}`}
                  value={score}
                  checked={values[index] === score}
                  onChange={() =>
                    setValues((current) =>
                      current.map((value, i) => (i === index ? score : value)),
                    )
                  }
                />
                <span>{score}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <fieldset>
        <legend>Would you take this faculty again?</legend>
        <div className="choice-options">
          <label>
            <input
              type="radio"
              name="again"
              checked={again === "yes"}
              onChange={() => setAgain("yes")}
            />{" "}
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="again"
              checked={again === "no"}
              onChange={() => setAgain("no")}
            />{" "}
            No
          </label>
        </div>
      </fieldset>
      <div className="review-preview-result">
        <b>Anonymous preview</b>
        <p>
          Teaching {values[0]}/5 · Grading {values[1]}/5 · Attendance{" "}
          {values[2]}/5 · Workload {values[3]}/5 · Take again: {again}
        </p>
        <small>Preview only. Nothing is published.</small>
      </div>
    </section>
  );
}

import { FacultyPicker } from '@/components/faculty-picker';

export default function Contribute() {
  return <main className="page-wrap">
    <div className="page-intro">
      <span className="eyebrow">PASS IT FORWARD</span>
      <h1>Three reviews. More faculty covered.</h1>
      <p>Choose faculty you studied under, then share three useful experiences. We suggest the least-reviewed from your own list first.</p>
    </div>
    <FacultyPicker />
    <div className="contribute-notes">
      <section className="panel">
        <h2>What you’ll write</h2>
        <p>For each faculty: overall, teaching, grading and workload ratings, whether you would take them again, and two or three specific sentences with your bottom line. Lab ease appears only if you had a lab.</p>
      </section>
      <section className="panel">
        <h2>How we protect trust</h2>
        <p className="muted">Your public review is anonymous and moderated. For now, your studied list is self-reported. Email or Google sign-in alone cannot prove you took a class with a faculty member.</p>
      </section>
    </div>
  </main>;
}

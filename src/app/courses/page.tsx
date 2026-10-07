import { Suspense } from "react";
import { Browse } from "@/components/browse";
export default function Courses() {
  return (
    <Suspense fallback={<main className="page-wrap">Loading courses…</main>}>
      <Browse kind="courses" />
    </Suspense>
  );
}

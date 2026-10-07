import { Suspense } from "react";
import { Browse } from "@/components/browse";
export default function Faculty() {
  return (
    <Suspense fallback={<main className="page-wrap">Loading faculty…</main>}>
      <Browse kind="faculty" />
    </Suspense>
  );
}

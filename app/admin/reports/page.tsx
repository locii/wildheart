import { Suspense } from "react";
import { ReportsView } from "@/components/admin/ReportsView";

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsView />
    </Suspense>
  );
}

import { IntakeQuestionsEditor } from "@/components/admin/IntakeQuestionsEditor";
import { createServiceClient } from "@/lib/supabase/server";
import type { IntakeQuestion } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function IntakePage() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("intake_questions")
    .select("*")
    .order("sort_order");

  return (
    <div className="px-4 py-5 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-1">Intake Form</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Questions sent to new clients before their first session.
      </p>
      <IntakeQuestionsEditor initialQuestions={(data ?? []) as IntakeQuestion[]} />
    </div>
  );
}

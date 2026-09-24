import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/Dashboard";
import { aggregate } from "@/lib/analytics/aggregate";
import { requireAdmin } from "@/lib/auth/require-admin";
import { questionnaire } from "@/lib/form/questionnaire";
import type { Submission } from "@/lib/form/types";
import { listSubmissions } from "@/lib/storage/submissions";

export const metadata: Metadata = {
  title: "Tableau de bord",
};

export default async function AdminPage() {
  await requireAdmin();

  let submissions: Submission[];
  try {
    submissions = await listSubmissions("live");
  } catch (error) {
    console.error("[admin] failed to load submissions", error);
    return (
      <main className="mx-auto max-w-275 px-5 py-16 sm:px-8">
        <h1 className="text-2xl font-semibold tracking-tight">Tableau de bord</h1>
        <p role="alert" className="mt-4 text-muted">
          Impossible de charger les réponses pour le moment. Le questionnaire reste disponible.
          Rechargez la page pour réessayer.
        </p>
      </main>
    );
  }

  const relevant = submissions.filter((s) => s.questionnaireId === questionnaire.id);
  return <Dashboard data={aggregate(relevant, questionnaire)} questionnaire={questionnaire} />;
}

import type { Metadata } from "next";
import { PreviewNotice } from "@/components/admin/PreviewNotice";
import { FormShell } from "@/components/form/FormShell";
import { requireAdmin } from "@/lib/auth/require-admin";
import { questionnaire } from "@/lib/form/questionnaire";

export const metadata: Metadata = {
  title: "Aperçu",
};

/** The real questionnaire, submitting to test storage so organisers can verify the full pipeline. */
export default async function PreviewPage() {
  await requireAdmin();
  return <FormShell questionnaire={questionnaire} mode="test" notice={<PreviewNotice />} />;
}

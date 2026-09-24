import { FormShell } from "@/components/form/FormShell";
import { questionnaire } from "@/lib/form/questionnaire";

export default function Home() {
  return <FormShell questionnaire={questionnaire} />;
}

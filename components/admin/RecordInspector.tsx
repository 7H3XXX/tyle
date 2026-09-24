import { checkSubmissionIntegrity } from "@/lib/analytics/integrity";
import { maximumScore } from "@/lib/form/scoring";
import type { Questionnaire, Submission } from "@/lib/form/types";
import { formatDate } from "./format";

const RECORD_LIMIT = 10;

/** What each stored field means. Keep in sync with `Submission` in lib/form/types.ts. */
const FIELD_GUIDE: Array<[field: string, description: string]> = [
  ["id", "Identifiant aléatoire généré par le serveur (UUID)."],
  ["questionnaireId", "Questionnaire auquel la réponse appartient."],
  ["mode", "« live » pour une vraie réponse, « test » pour l'aperçu."],
  ["createdAt", "Date et heure d'enregistrement (UTC)."],
  ["answers", "Identifiants des affirmations cochées, par thème."],
  ["totalSelected", "Nombre de cases cochées, calculé par le serveur."],
  ["bandId", "Tranche de résultat affichée au répondant."],
  ["domainScores", "Cases cochées, maximum et pourcentage par thème."],
  ["timing.totalMs", "Durée entre « Commencer » et l'envoi, en millisecondes."],
];

type RecordInspectorProps = {
  submissions: Submission[];
  questionnaire: Questionnaire;
};

export function RecordInspector({ submissions, questionnaire }: RecordInspectorProps) {
  const records = submissions.slice(0, RECORD_LIMIT);
  const labels = new Map(
    questionnaire.sections.flatMap((s) => s.choices.map((c) => [c.id, c.label] as const)),
  );
  const bandTitles = new Map(questionnaire.resultBands.map((b) => [b.id, b.title]));
  const maximum = maximumScore(questionnaire);

  return (
    <section aria-labelledby="records-heading" className="flex flex-col gap-8">
      <header>
        <h2 id="records-heading" className="text-lg font-semibold tracking-tight">
          Données enregistrées
        </h2>
        <p className="mt-1 max-w-180 text-sm text-muted">
          Chaque réponse de test apparaît ici exactement telle qu&apos;elle est stockée. Les vraies réponses
          ont la même structure mais ne sont jamais affichées individuellement.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="flex flex-col gap-4">
          <dl className="flex flex-col text-sm">
            {FIELD_GUIDE.map(([field, description]) => (
              <div key={field} className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-b-0">
                <dt className="font-mono text-[0.8125rem]">{field}</dt>
                <dd className="text-muted">{description}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted">
            <strong className="font-medium text-foreground">Jamais collecté :</strong> nom, e-mail,
            téléphone, adresse IP, localisation, navigateur ou identifiant d&apos;appareil.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          {records.length === 0 && (
            <p className="text-sm text-muted">Aucun enregistrement de test pour le moment.</p>
          )}
          {records.map((record, index) => {
            const issues = checkSubmissionIntegrity(record, questionnaire);
            const checked = questionnaire.sections.filter((s) => record.answers[s.id]?.length);
            return (
              <details
                key={record.id}
                open={index === 0}
                className="group rounded-xl border border-border open:bg-subtle/40"
              >
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 rounded-xl px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-accent">
                  <span className="tabular-nums">{formatDate(record.createdAt)}</span>
                  <span className="tabular-nums text-muted">
                    {record.totalSelected} / {maximum}
                  </span>
                  <span className="text-muted">{bandTitles.get(record.bandId) ?? record.bandId}</span>
                  <IntegrityBadge issueCount={issues.length} />
                </summary>

                <div className="flex flex-col gap-4 border-t border-border px-4 py-4">
                  {issues.length > 0 && (
                    <ul role="alert" className="flex flex-col gap-1 text-sm text-danger">
                      {issues.map((issue) => (
                        <li key={issue.field}>
                          <code>{issue.field}</code> : enregistré {JSON.stringify(issue.stored)}, attendu{" "}
                          {JSON.stringify(issue.expected)}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="text-sm">
                    <p className="font-medium">Cases cochées</p>
                    {checked.length === 0 ? (
                      <p className="mt-1 text-muted">Aucune.</p>
                    ) : (
                      <ul className="mt-1 flex flex-col gap-1 text-muted">
                        {checked.map((s) => (
                          <li key={s.id}>
                            <span className="text-foreground">{s.title}</span> :{" "}
                            {record.answers[s.id].map((id) => labels.get(id) ?? id).join(" · ")}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-relaxed">
                    {JSON.stringify(record, null, 2)}
                  </pre>
                </div>
              </details>
            );
          })}
          {submissions.length > RECORD_LIMIT && (
            <p className="text-sm text-muted">
              {RECORD_LIMIT} plus récents sur {submissions.length}.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function IntegrityBadge({ issueCount }: { issueCount: number }) {
  const ok = issueCount === 0;
  return (
    <span
      className={
        ok
          ? "ml-auto rounded-full border border-accent/40 px-2 py-0.5 text-xs font-medium text-accent"
          : "ml-auto rounded-full border border-danger/40 px-2 py-0.5 text-xs font-medium text-danger"
      }
    >
      {ok ? "✓ Score cohérent" : `${issueCount} écart${issueCount > 1 ? "s" : ""}`}
    </span>
  );
}

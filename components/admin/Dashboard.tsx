import type { ReactNode } from "react";
import type { Aggregate } from "@/lib/analytics/aggregate";
import type { Questionnaire } from "@/lib/form/types";
import { ChoiceFrequency } from "./ChoiceFrequency";
import { DomainBreakdown } from "./DomainBreakdown";
import { formatNumber, formatPercent } from "./format";
import { MetricCard } from "./MetricCard";
import { ResponseTable } from "./ResponseTable";
import { ScoreDistribution } from "./ScoreDistribution";

type DashboardProps = {
  data: Aggregate;
  questionnaire: Questionnaire;
};

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export function Dashboard({ data, questionnaire }: DashboardProps) {
  const max = data.maximum;

  return (
    <main className="mx-auto flex max-w-275 flex-col gap-14 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{questionnaire.title}</p>
          <h1 className="mt-1 text-[2rem] font-semibold tracking-tight">Tableau de bord</h1>
        </div>
        <a
          href="/admin"
          className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-subtle focus-visible:outline-2 focus-visible:outline-accent"
        >
          Actualiser
        </a>
      </header>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Répondants" value={String(data.respondents)} />
        <MetricCard label="Score moyen" value={formatNumber(data.averageScore)} suffix={`/ ${max}`} />
        <MetricCard label="Score médian" value={formatNumber(data.medianScore)} suffix={`/ ${max}`} />
        <MetricCard label="Min – max" value={`${data.minScore} – ${data.maxScore}`} suffix={`/ ${max}`} />
        <MetricCard label="Score moyen en %" value={formatPercent(data.averagePercentage)} />
      </dl>

      {data.respondents === 0 ? (
        <p className="text-muted">Aucune réponse pour le moment.</p>
      ) : (
        <>
          <div className="grid gap-14 lg:grid-cols-2">
            <Panel title="Répartition des résultats" description="Nombre et part de répondants par tranche.">
              <ScoreDistribution bands={data.bands} distribution={data.scoreDistribution} />
            </Panel>
            <Panel
              title="Par thème"
              description="Moyenne de cases cochées ; les pourcentages permettent de comparer des thèmes de tailles différentes."
            >
              <DomainBreakdown domains={data.domains} />
            </Panel>
          </div>

          <Panel title="Fréquence des affirmations" description="Part des répondants ayant coché chaque affirmation.">
            <ChoiceFrequency choices={data.choices} />
          </Panel>

          <Panel title="Réponses" description="Nombre de cases cochées par thème, de la plus récente à la plus ancienne.">
            <ResponseTable rows={data.rows} sections={questionnaire.sections} maximum={max} />
          </Panel>
        </>
      )}

      <p className="text-xs text-muted">
        Données descriptives issues d&apos;un questionnaire d&apos;auto-évaluation ; elles ne constituent pas des
        diagnostics.
      </p>
    </main>
  );
}

import { FlaskConicalIcon, InboxIcon, RefreshCwIcon, SquarePenIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { Aggregate } from "@/lib/analytics/aggregate";
import type { Questionnaire, SubmissionMode } from "@/lib/form/types";
import { ChoiceFrequency } from "./ChoiceFrequency";
import { DataModeTabs } from "./DataModeTabs";
import { DomainBreakdown } from "./DomainBreakdown";
import { formatNumber, formatPercent } from "./format";
import { MetricCard } from "./MetricCard";
import { ResponseTable } from "./ResponseTable";
import { ScoreDistribution } from "./ScoreDistribution";

type DashboardProps = {
  data: Aggregate;
  questionnaire: Questionnaire;
  mode: SubmissionMode;
  /** Extra sections rendered after the statistics (e.g. the test record inspector). */
  children?: ReactNode;
};

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-5">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </header>
      {children}
    </section>
  );
}

function NoResponses({ isTest }: { isTest: boolean }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">{isTest ? <FlaskConicalIcon /> : <InboxIcon />}</EmptyMedia>
        <EmptyTitle>{isTest ? "Aucune réponse de test" : "Aucune réponse pour le moment"}</EmptyTitle>
        <EmptyDescription>
          {isTest
            ? "Remplissez le questionnaire depuis l'aperçu, puis revenez ici pour voir ce qui a été enregistré."
            : "Les statistiques apparaîtront dès la première réponse."}
        </EmptyDescription>
      </EmptyHeader>
      {isTest && (
        <EmptyContent>
          <Link href="/admin/preview" className={buttonVariants()}>
            Ouvrir l&apos;aperçu
          </Link>
        </EmptyContent>
      )}
    </Empty>
  );
}

export function Dashboard({ data, questionnaire, mode, children }: DashboardProps) {
  const max = data.maximum;
  const isTest = mode === "test";

  return (
    <main className="mx-auto flex max-w-275 flex-col gap-14 px-5 py-10 sm:px-8 sm:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{questionnaire.title}</p>
          <h1 className="mt-1 text-[2rem] font-semibold tracking-tight">Tableau de bord</h1>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Link href="/admin/preview" className={buttonVariants({ variant: "ghost" })}>
            <SquarePenIcon data-icon="inline-start" />
            Aperçu du questionnaire
          </Link>
          {/* Plain <a>: a full reload re-reads storage on this dynamic page. */}
          <a href={isTest ? "/admin?data=test" : "/admin"} className={buttonVariants({ variant: "ghost" })}>
            <RefreshCwIcon data-icon="inline-start" />
            Actualiser
          </a>
        </div>
      </header>

      <div className="-mt-6 flex flex-col gap-4">
        <DataModeTabs current={mode} />
        {isTest && (
          <Alert role="note" className="max-w-180">
            <FlaskConicalIcon />
            <AlertDescription>
              Réponses envoyées depuis l&apos;aperçu. Elles sont stockées à part et n&apos;apparaissent jamais dans
              les statistiques réelles.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Répondants" value={String(data.respondents)} />
        <MetricCard label="Score moyen" value={formatNumber(data.averageScore)} suffix={`/ ${max}`} />
        <MetricCard label="Score médian" value={formatNumber(data.medianScore)} suffix={`/ ${max}`} />
        <MetricCard label="Min – max" value={`${data.minScore} – ${data.maxScore}`} suffix={`/ ${max}`} />
        <MetricCard label="Score moyen en %" value={formatPercent(data.averagePercentage)} />
      </dl>

      {data.respondents === 0 ? (
        <NoResponses isTest={isTest} />
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

      {children}

      <p className="text-xs text-muted-foreground">
        Données descriptives issues d&apos;un questionnaire d&apos;auto-évaluation ; elles ne constituent pas des
        diagnostics.
      </p>
    </main>
  );
}

import Link from "next/link";

export function PreviewNotice() {
  return (
    <div role="note" className="border-b border-border bg-subtle">
      <div className="mx-auto flex max-w-180 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2.5 text-sm sm:px-8">
        <p>
          <strong className="font-semibold">Aperçu</strong>
          <span className="text-muted"> · les réponses sont enregistrées comme tests</span>
        </p>
        <Link
          href="/admin?data=test"
          className="rounded font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Voir les données enregistrées
        </Link>
      </div>
    </div>
  );
}

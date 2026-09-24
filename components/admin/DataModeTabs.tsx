import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { SubmissionMode } from "@/lib/form/types";

const TABS: Array<{ mode: SubmissionMode; label: string; href: string }> = [
  { mode: "live", label: "Réponses réelles", href: "/admin" },
  { mode: "test", label: "Réponses de test", href: "/admin?data=test" },
];

/** Navigation between datasets: real links (not buttons) styled with shadcn button variants. */
export function DataModeTabs({ current }: { current: SubmissionMode }) {
  return (
    <nav aria-label="Jeu de données" className="inline-flex w-fit gap-1 rounded-xl border p-1">
      {TABS.map((tab) => {
        const active = tab.mode === current;
        return (
          <Link
            key={tab.mode}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={buttonVariants({ variant: active ? "default" : "ghost" })}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import { cn } from "@/lib/cn";
import type { SubmissionMode } from "@/lib/form/types";

const TABS: Array<{ mode: SubmissionMode; label: string; href: string }> = [
  { mode: "live", label: "Réponses réelles", href: "/admin" },
  { mode: "test", label: "Réponses de test", href: "/admin?data=test" },
];

export function DataModeTabs({ current }: { current: SubmissionMode }) {
  return (
    <nav aria-label="Jeu de données" className="inline-flex rounded-xl border border-border p-1 text-sm">
      {TABS.map((tab) => {
        const active = tab.mode === current;
        return (
          <Link
            key={tab.mode}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent",
              active ? "bg-foreground text-background" : "text-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

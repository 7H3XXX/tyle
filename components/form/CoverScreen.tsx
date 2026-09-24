import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { maximumScore } from "@/lib/form/scoring";
import type { Questionnaire } from "@/lib/form/types";

type CoverScreenProps = {
  questionnaire: Questionnaire;
  onStart: () => void;
};

export function CoverScreen({ questionnaire, onStart }: CoverScreenProps) {
  const { title, description, disclaimer, branding, sections } = questionnaire;

  return (
    <div className="flex flex-1 flex-col justify-center py-12 sm:py-20">
      {branding.coverImageUrl && (
        <Image
          src={branding.coverImageUrl}
          alt=""
          width={1440}
          height={720}
          unoptimized
          priority
          className="mb-10 aspect-square w-full rounded-2xl object-cover"
        />
      )}

      <h1
        tabIndex={-1}
        className="text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-tight outline-none sm:text-[3.25rem]"
      >
        {title}
      </h1>

      {description && (
        <p className="mt-5 max-w-136 text-pretty text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {sections.length} thèmes · {maximumScore(questionnaire)} affirmations · Réponses anonymes
      </p>

      <div className="mt-10">
        <Button size="xl" onClick={onStart} className="w-full sm:w-auto">
          Commencer
          <ArrowRightIcon data-icon="inline-end" />
        </Button>
      </div>

      {disclaimer && (
        <p className="mt-12 max-w-136 text-[0.8125rem] leading-relaxed text-muted-foreground">{disclaimer}</p>
      )}
    </div>
  );
}

import type { Choice, Questionnaire, Section } from "./types";

/** Builds stable choice IDs (`energie-1`, `energie-2`, …) from ordered labels. */
function section(id: string, title: string, labels: string[]): Section {
  const choices: Choice[] = labels.map((label, index) => ({
    id: `${id}-${index + 1}`,
    label,
  }));
  return { id, title, choices };
}

export const questionnaire: Questionnaire = {
  id: "statut-mitochondrial",
  title: "Auto-évaluation du statut mitochondrial",
  description:
    "Parcourez sept thèmes et cochez les affirmations qui vous ressemblent. Aucune case n'est obligatoire.",
  disclaimer:
    "Cet outil d'auto-évaluation ne remplace pas un avis médical et ne constitue pas un diagnostic.",
  branding: {
    logoText: "M",
    coverImageUrl: "/images/cover-conference.png",
    logoUrl: "/images/iusty-logo.jpg",
  },
  sections: [
    section("energie", "Énergie", [
      "Je me suis réveillé fatigué",
      "Je me sens épuisé après un repas",
      "J'ai besoin de café pour fonctionner",
      "Je manque d'endurance",
      "Je récupère très lentement après un effort",
    ]),
    section("metabolisme", "Métabolisme", [
      "J'ai des fringales sucrées",
      "Je prends du poids facilement",
      "Je fais de l'hypoglycémie réactionnelle",
      "J'ai un ventre gonflé/enflammé",
    ]),
    section("cerveau-humeur", "Cerveau/humeur", [
      "J'ai du brouillard mental",
      "Je perds mes mots",
      "Je me sens anxieux sans raison claire",
      "J'ai du mal à me concentrer",
      "Je suis irrité ou à fleur de peau",
      "Je suis déprimé",
    ]),
    section("muscles", "Muscles", [
      "Mes muscles me font mal",
      "Je me fatigue rapidement",
      "Je ne tolère plus l'effort",
      "Je fais souvent des crampes",
    ]),
    section("digestion", "Digestion", [
      "Je suis balloné",
      "Mes gaz sont maldorants",
      "Je digère lentement",
      "Je deviens intolérant à certains aliments",
    ]),
    section("hormones-temperature", "Hormones/température", [
      "Je suis frileux",
      "Mon cycle est irrégulier ou difficile",
      "Je manque de libido",
      "Je gère mal le stress",
    ]),
    section("immunite", "Immunité", [
      "Je tombe souvent malade",
      "Je récupère lentement après un virus",
      "J'ai des inflammations chroniques",
    ]),
  ],
  resultBands: [
    {
      id: "normal",
      min: 0,
      max: 5,
      title: "0-5 cases cochées",
      description: "fluctuations normales, surveiller l'hygiène de vie.",
    },
    {
      id: "probable",
      min: 6,
      max: 12,
      title: "6-12 cases cochées",
      description:
        "déséquilibre mitochondrial probable; agir sur l'alimentation, le sommeil, la lumière, le mouvement.",
    },
    {
      id: "strong",
      min: 13,
      title: "Plus de 12 cases cochées",
      description:
        "suspicion forte de dysfonctionnement mitochondrial, Consulter un professionnel formé + réaliser un bilan.",
    },
  ],
};

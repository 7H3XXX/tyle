# Auto-évaluation du statut mitochondrial

Questionnaire multi-étapes (Next.js 16, App Router) + tableau de bord `/admin`.

## Développement

```bash
npm install
npm run dev        # http://localhost:3000 — réponses stockées dans .data/submissions (local)
npm test           # scoring, validation, agrégats, intégrité
npm run lint && npm run build
```

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Questions, thèmes, tranches de résultat, logo/couverture/couleur | `lib/form/questionnaire.ts` |
| Calcul du score | `lib/form/scoring.ts` |
| Stockage (Vercel Blob / local) | `lib/storage/` |
| Couleurs (tokens shadcn ; la couleur de marque est `--primary`) | `app/globals.css` |
| Composants UI (shadcn/ui, Base UI) | `components/ui/` — ajout via `npx shadcn@latest add <nom>` |

## Aperçu et réponses de test

- `/admin/preview` : le vrai questionnaire, dont les réponses sont enregistrées **comme tests**
  (`test-submissions/`), jamais mélangées aux vraies réponses.
- `/admin?data=test` : statistiques des réponses de test, plus l'inspecteur « Données enregistrées »
  (JSON exact de chaque enregistrement, guide des champs, contrôle de cohérence du score).
- Pour repartir de zéro avant l'événement, supprimez le préfixe `test-submissions/` dans le Blob store
  (ou `.data/test-submissions` en local).

Décisions : [`docs/adr`](docs/adr/README.md).

## Déploiement Vercel

1. Importer le projet dans Vercel.
2. Storage → créer un **Blob store** (accès *private*) et le connecter au projet (ajoute `BLOB_READ_WRITE_TOKEN`).
3. Ajouter `ADMIN_PASSWORD` (et optionnellement `ADMIN_USER`, défaut `admin`). Sans mot de passe, `/admin` répond 503 en production.
4. Déployer, puis ouvrir `/admin/preview`, envoyer une réponse et vérifier dans `/admin?data=test`
   qu'elle apparaît avec le badge « Score cohérent ».
5. Suivre la checklist du jour J (CLAUDE.md §40) : test depuis deux téléphones, réponses simultanées, etc.

Chaque réponse est un objet privé indépendant `submissions/{uuid}.json` ; le score est toujours recalculé côté serveur.

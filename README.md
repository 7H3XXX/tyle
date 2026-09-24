# Auto-évaluation du statut mitochondrial

Questionnaire multi-étapes (Next.js 16, App Router) + tableau de bord `/admin`.

## Développement

```bash
npm install
npm run dev        # http://localhost:3000 — réponses stockées dans .data/submissions (local)
npm test           # scoring, validation, agrégats
npm run lint && npm run build
```

## Où modifier quoi

| Quoi | Fichier |
|---|---|
| Questions, thèmes, tranches de résultat, logo/couverture/couleur | `lib/form/questionnaire.ts` |
| Calcul du score | `lib/form/scoring.ts` |
| Stockage (Vercel Blob / local) | `lib/storage/` |
| Couleurs (variables CSS) | `app/globals.css` |

## Déploiement Vercel

1. Importer le projet dans Vercel.
2. Storage → créer un **Blob store** (accès *private*) et le connecter au projet (ajoute `BLOB_READ_WRITE_TOKEN`).
3. Ajouter `ADMIN_PASSWORD` (et optionnellement `ADMIN_USER`, défaut `admin`). Sans mot de passe, `/admin` répond 503 en production.
4. Déployer, puis suivre la checklist du jour J (CLAUDE.md §40) : réponse test → visible dans `/admin` → score correct → test depuis deux téléphones.

Chaque réponse est un objet privé indépendant `submissions/{uuid}.json` ; le score est toujours recalculé côté serveur.

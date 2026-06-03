# F8 — Statistiques (frontend)

Page `features/statistiques` câblée sur l'endpoint backend `GET /api/stats`.

## Stack ajoutée

- `chart.js` ^4.5
- `ng2-charts` ^10

## Fichiers

- `src/app/core/models/statistics.model.ts` — interfaces `StatisticsResponse`, `CategorieBreakdown`, `EvolutionPoint`.
- `src/app/core/services/statistics.service.ts` — `get(period, groupId?)`.
- `src/app/core/services/category.service.ts` — wrap `GET /api/categories` avec cache `shareReplay` et fallback (`FALLBACK_CATEGORIES`) si l'API échoue.
- `src/app/features/statistiques/statistiques.page.ts` — composant injectant `StatisticsService`. `setPeriod()` refetch sur changement de valeur.
- `statistiques.page.html` — deux `<canvas baseChart>` (doughnut + line), liste par catégorie avec barres colorées, trois cartes résumé.
- `statistiques.module.ts` — import de `BaseChartDirective` depuis `ng2-charts`.

## Tests

- `category.service.spec.ts` — succès + fallback HTTP error.
- `statistics.service.spec.ts` — paramètres, succès, erreur HTTP.
- `statistiques.page.spec.ts` — état initial, refetch sur changement de période, formatage montants, construction des datasets de graphes.

## Refactor connexe

`DEFAULT_CATEGORIES` (constante locale historique) renommée `FALLBACK_CATEGORIES` et utilisée uniquement comme repli. `add-expense.page.ts` consomme désormais `CategoryService.list()` à la place. Cela aligne le périmètre F3 différé (catégories en BDD) avec la nouvelle réalité backend.

## Référence dossier

§III.5 — F8 Statistiques.

## PRs

- Backend : Saar45/split-easy-api#12
- Frontend : Saar45/split-easy-app#14

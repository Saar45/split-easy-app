# split-easy-app

SPA Angular 20 + Ionic 8 de l'application **Split-Easy** — gestion de dépenses partagées entre groupes.
Projet fil rouge CDA niveau 6 (RNCP 37873), IPSSI promotion 2025-2026.

Backend Symfony : repo séparé `split-easy-api`.

## Démarrage rapide

### En local (hot reload)

```bash
git clone <repo-url> split-easy-app
cd split-easy-app
npm install --legacy-peer-deps
npm start          # ng serve sur http://localhost:8100
```

Pré-requis : l'API doit tourner en parallèle (cf. README du repo `split-easy-api`).

### Via Docker

Le `docker-compose.yml` vit dans `split-easy-api`. Cloner les deux repos côte à côte puis :

```bash
cd ../split-easy-api
docker compose --profile dev up -d --build
```

## Stack technique

| Composant   | Choix                             |
| ----------- | --------------------------------- |
| Framework   | Angular 20 (TypeScript strict)    |
| UI mobile   | Ionic 8                           |
| State/async | RxJS                              |
| HTTP        | Angular HttpClient + Interceptors |
| Graphiques  | Chart.js                          |
| Tests       | Karma + Jasmine                   |
| Conteneur   | Multi-stage node:20 → nginx:alpine|

## Structure du projet

```
split-easy-app/
├── src/
│   ├── app/
│   │   ├── core/                 # services singleton, guards, interceptors (à venir)
│   │   ├── shared/               # composants/pipes réutilisables (à venir)
│   │   ├── features/             # modules lazy-loadés par fonctionnalité
│   │   │   ├── dashboard/
│   │   │   ├── groupes/
│   │   │   ├── ajouter/
│   │   │   ├── statistiques/
│   │   │   └── profil/
│   │   ├── tabs/                 # bottom tab bar (5 entrées)
│   │   ├── app.module.ts
│   │   └── app-routing.module.ts
│   ├── environments/             # environment.ts / environment.prod.ts
│   ├── theme/variables.scss      # tokens charte graphique
│   └── global.scss               # Google Fonts + Ionic CSS
├── Dockerfile                    # build multi-stage node → nginx
├── nginx.conf                    # SPA fallback + headers sécurité
└── .dockerignore
```

## Tests

```bash
npm test                            # Karma watch
npx ng test --watch=false --browsers=ChromeHeadless --code-coverage
```

## Statut Jalon 5

Squelette initialisé : bottom tab bar 5 entrées, theme tokens charte graphique, Dockerfile multi-stage, environments. Prochaines étapes : F1 authentification, F2 gestion groupes.

# split-easy-app

[![CI](https://github.com/Saar45/split-easy-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Saar45/split-easy-app/actions/workflows/ci.yml)

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

## Fonctionnalités livrées (v1.0.0)

| Code | Périmètre |
|------|-----------|
| F1   | Auth : login, register, refresh, JWT en RAM |
| F2   | Liste / création / détail groupes + invitations |
| F3   | Ajout dépense avec catégories |
| F4   | Répartition 3 modes (chips équitable / personnalisée / pourcentage) |
| F5   | Soldes optimisés greedy affichés dans Détail groupe |
| F6   | Workflow remboursement bipartite (proposer / accepter / contester / annuler) |
| F7   | Page Invitations en attente |
| F8   | Statistiques avec doughnut et line charts (Chart.js) |
| F9   | Cloche notifications dans l'Accueil + page Notifications avec polling 30s |
| RGPD | Export données + suppression compte depuis Profil |

## Comptes de test

Mêmes comptes que le backend (voir README du repo `split-easy-api`).

## Statut

v1.0.0 feature-complete et conforme au dossier v3.0.

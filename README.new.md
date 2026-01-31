# BackOffice Vue TS (Template)

Template BackOffice en Vue 3 + TypeScript, aligne sur la logique Angular de reference.
Objectif : un socle reutilisable, pret pour API admin, tests et CI.

## Stack
- Vue 3 (SFC `<script setup>`)
- Vite
- Pinia (state)
- Vue Router
- Axios
- Vitest + Vue Test Utils
- Playwright (E2E)
- ESLint + Prettier

## Fonctionnalites
- Auth admin (login/logout, routes protegees)
- Dashboard (KPIs + recents)
- CRUD Users / Products / Orders / Audit Logs
- Filtres, pagination, tri, export CSV
- Batch actions (activate/deactivate/delete)

## Prerequis
- Node.js (version recente LTS recommande)
- API compatible (endpoints admin)
- Ports par defaut :
  - Front : `http://localhost:5173`
  - API : `http://localhost:3000` (dev) ou `http://localhost:3001` (e2e)

## Configuration
### `.env` (dev)
Exemple minimal :
```
VITE_API_URL=http://localhost:3000/api
```

### `.env.e2e`
Utilise par Playwright (charge via `dotenv` dans la config) :
```
E2E_ADMIN_EMAIL=admin@example.com
E2E_ADMIN_PASSWORD=Admin123!
E2E_API_URL=http://localhost:3001/api
```

## Scripts utiles
- `npm run dev` : dev server
- `npm run build` : build prod (inclut `vue-tsc`)
- `npm run preview` : preview build
- `npm run test:unit` : tests unitaires (Vitest)
- `npm run e2e` : tests Playwright
- `npm run e2e:full` : e2e + logout
- `npm run e2e:ui` : UI mode Playwright
- `npm run e2e:debug` : debug Playwright
- `npm run lint` / `npm run lint:fix`
- `npm run format:check` / `npm run format` / `npm run format:fix`

## Architecture (resume)
```
src/
  api/            (axios, csrf)
  components/     (layout, navbar)
  messages/       (messages UI/auth)
  router/         (routes + guards)
  stores/         (Pinia)
  views/          (pages)
  tests/
    e2e/          (Playwright)
    unit/         (Vitest)
```

## Endpoints utilises (API)
Routes admin alignees :
- `GET /admin/users`, `POST /users/register`, `PATCH /users/:id`, `DELETE /users/:id`
- `GET /admin/products`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`
- `GET /admin/orders`, `PATCH /orders/:id`
- `GET /admin/audit-logs`
- `GET /admin/*/export` (CSV)
- Batch: `POST /admin/products/batch-update`, `POST /admin/products/batch-delete`

## Tests
### Unitaires
Localises dans `src/tests/unit` :
- store auth (Pinia)
- interceptors axios (CSRF)
- login component

### E2E
Localises dans `src/tests/e2e` :
- smoke
- auth
- users
- products
- orders
- audit logs

## Qualite
Verifs recommandees avant PR :
- `npm run lint`
- `npm run format:check`
- `npm run test:unit`
- `npm run e2e`

## Encodage UTF-8
Tous les fichiers front et la documentation sont en **UTF-8**.
Gardez les accents natifs et evitez les entites HTML (`&eacute;`, `&agrave;`, etc.).

Controle automatique d'encodage (pre build/dev) :
- Script : `scripts/check-encoding.ps1`
- Commande : `npm run check:encoding`
- Execute avant `npm run dev`, `npm run build` et `npm run preview` via les scripts `pre*`.

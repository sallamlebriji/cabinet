# Architecture complète

## Vue générale

Le projet est organisé en monorepo professionnel avec deux applications indépendantes:

- `server/`: API REST Node.js, Express.js, MongoDB, Mongoose, JWT, refresh token, sécurité et validations.
- `client/`: application React.js TypeScript, Tailwind CSS, Framer Motion, GSAP, Lucide React.
- `docs/`: documentation technique, endpoints et notes d'évolution.

## Backend

```txt
server/
  src/
    config/        Connexion MongoDB, environnement, sécurité
    controllers/   Logique HTTP par ressource
    middlewares/   Auth, rôles, erreurs, upload
    models/        Schémas MongoDB/Mongoose
    routes/        Définition des endpoints REST
    services/      Services métier et intégrations
    utils/         Helpers, tokens, réponses API
    validators/    Validation express-validator
    types/         Types Express étendus
```

## Frontend

```txt
client/
  src/
    components/    UI réutilisable et layout
    sections/      Sections publiques animées
    pages/         Pages publiques et privées
    assets/        Images et médias locaux
    data/          Données statiques UI
    hooks/         Hooks React
    layouts/       Layouts public et dashboard
    services/      Client API
    store/         Auth context et état global léger
    utils/         Helpers CSS/formatters
```

## Rôles

- `superadmin`: accès plateforme complet.
- `admin`: gestion complète du cabinet.
- `employee`: opérations quotidiennes, rendez-vous, clients, documents.
- `client`: accès profil, documents, rendez-vous et factures personnelles.

## Principes

- Authentification stateless avec access token court et refresh token en cookie HTTP-only.
- Validation centralisée avec `express-validator`.
- Sécurité: Helmet, CORS contrôlé, rate limiting, sanitization Mongo, compression.
- UI responsive, dense mais premium, avec micro-interactions mesurées.

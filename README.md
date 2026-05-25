# Cabinet Pro MERN

Application web MERN complète pour la gestion d’un cabinet professionnel, avec interface premium, responsive et animée.

## Technologies

- Frontend: React.js, TypeScript, Vite, Tailwind CSS, Framer Motion, GSAP, Lucide React, Recharts
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Authentification: JWT access token, refresh token HTTP-only, bcrypt
- Sécurité: Helmet, CORS, rate limiting, Mongo sanitization, validation express-validator
- Documents: upload local prêt à étendre vers Cloudinary
- Temps réel: Socket.io

## Structure

```txt
cabinet/
  client/   Application React TypeScript premium
  server/   API Express/Mongoose sécurisée
  docs/     Architecture et endpoints
```

## Installation

```bash
npm install
cp .env.example .env
```

Modifiez `.env` avec votre URI MongoDB et vos secrets JWT.

## Lancement local

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Build

```bash
npm run build
```

## API

La documentation des endpoints est disponible dans [docs/API.md](docs/API.md).

## Schémas MongoDB

Les modèles Mongoose se trouvent dans `server/src/models`:

- `User`: nom, email, password hashé, rôle, avatar, tokenVersion, statut.
- `Client`: identité, contact, notes, tags, créateur.
- `Service`: nom, prix, durée, description, statut.
- `Appointment`: client, employé, service, dates, statut.
- `Invoice`: numéro, client, lignes, taxes, total, statut, montant payé.
- `Document`: titre, URL fichier, type, taille, client associé.
- `Notification`: titre, message, utilisateur, type, lecture.
- `Setting`: nom du cabinet, logo, coordonnées, horaires, préférences.

## Déploiement Render

1. Créez un service Web Render depuis le repository.
2. Root directory: `server`.
3. Build command: `npm install && npm run build`.
4. Start command: `npm start`.
5. Ajoutez les variables d’environnement server depuis `.env.example`.
6. Autorisez l’URL Vercel dans `CLIENT_URL`.

## Déploiement Vercel

1. Créez un projet Vercel depuis le repository.
2. Root directory: `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Ajoutez `VITE_API_URL=https://votre-api-render.onrender.com/api/v1`.

## Améliorations futures

- Permissions granulaires par module et par action.
- Intégration Cloudinary complète avec suppression distante.
- Emails transactionnels pour mot de passe oublié et rappels.
- Calendrier drag and drop avec vues semaine/mois.
- Tests unitaires et e2e avec Vitest et Playwright.
- Audit logs, multi-cabinets et tableaux de bord avancés.

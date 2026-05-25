# API Endpoints

Base URL: `/api/v1`

## Auth

- `POST /auth/register` crée un utilisateur.
- `POST /auth/login` connecte et émet access/refresh tokens.
- `POST /auth/refresh-token` renouvelle l'access token.
- `POST /auth/forgot-password` prépare une réinitialisation.
- `POST /auth/reset-password` change le mot de passe.
- `POST /auth/logout` révoque le refresh token.
- `GET /auth/me` retourne le profil connecté.

## Dashboard

- `GET /dashboard/stats` statistiques globales du cabinet.

## Clients / Patients

- `GET /clients` liste paginée avec recherche.
- `POST /clients` crée un client.
- `GET /clients/:id` détail et historique.
- `PUT /clients/:id` met à jour.
- `DELETE /clients/:id` supprime.

## Rendez-vous

- `GET /appointments` liste filtrable.
- `POST /appointments` crée un rendez-vous.
- `PUT /appointments/:id` modifie.
- `PATCH /appointments/:id/status` change le statut.
- `DELETE /appointments/:id` annule/supprime.

## Services

- `GET /services`
- `POST /services`
- `PUT /services/:id`
- `DELETE /services/:id`

## Factures

- `GET /invoices`
- `POST /invoices`
- `GET /invoices/:id`
- `PATCH /invoices/:id/status`
- `GET /invoices/:id/pdf`

## Employés

- `GET /employees`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`

## Documents

- `GET /documents`
- `POST /documents`
- `GET /documents/:id/download`
- `DELETE /documents/:id`

## Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

## Paramètres

- `GET /settings`
- `PUT /settings`

# AssurMoi API

## Installation

```bash
npm install
```

## Variables d'environnement

Copier `.env.sample` vers `.env` puis adapter si besoin.

## Base de données

```bash
npm run migrate
npm run seed
```

## Lancement

```bash
npm run dev
```

## Swagger

- `GET /docs`
- `GET /swagger.json`

## Authentification

- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

La double authentification utilise l'envoi d'un code par email via MailHog en développement.

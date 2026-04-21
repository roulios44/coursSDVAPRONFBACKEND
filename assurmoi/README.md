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

Avec le `docker-compose.yml` du dossier parent, l'API peut envoyer les emails vers MailHog sur `mailhog:1025`.
L'interface MailHog est disponible sur `http://localhost:8025`.

## Swagger

- `GET /docs`
- `GET /swagger.json`

## Mail

Variables utiles :

- `MAIL_HOST=mailhog`
- `MAIL_PORT=1025`
- `MAIL_SECURE=false`
- `MAIL_FROM=no-reply@assurmoi.local`
- `MAILHOG_UI_URL=http://localhost:8025`

Le service métier d'envoi est centralisé dans `services/mail.js` et s'appuie sur `lib/mailer.js`.
Un endpoint de test protégé est disponible sur `POST /api/mail/test`.

Exemple de payload :

```json
{
  "to": "test@example.com",
  "subject": "Test MailHog",
  "text": "Bonjour depuis AssurMoi"
}
```

## Authentification

- `POST /api/auth/login`
- `POST /api/auth/verify-2fa`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`

La double authentification, la réinitialisation du mot de passe et le mail de bienvenue envoient maintenant un email via MailHog en développement.

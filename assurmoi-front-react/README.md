# AssurMoi Front React

Frontend React/Vite pour consommer l'API AssurMoi.

## Lancer

```bash
cd assurmoi-front-react
npm install
npm run dev
```

## Hypotheses

- Le backend tourne sur `http://localhost:3000`
- Les routes d'auth sont exposees sous `/api/auth/*`
- Le frontend tourne sur `http://localhost:5173`

## Fonctionnalites

- Connexion et validation 2FA
- Stockage du token
- Dashboard avec indicateurs et repartitions
- Centre d'operations pour creer utilisateurs, contrats, sinistres et dossiers
- Vues de ressources avec recherche, tableau et detail
- Logout avec revocation du token

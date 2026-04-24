# coursSDVAPRONFBACKEND

## Lancer le projet

Le projet se lance via Docker Compose. Le backend applique automatiquement les migrations, injecte les donnees de test, puis demarre l'API. Le front Expo demarre aussi dans Docker.

### Commande a lancer

Remplace `TON_IP_LOCALE` par l'IP locale de ton Mac/PC sur le meme reseau que ton telephone.

```bash
EXPO_PACKAGER_HOSTNAME=TON_IP_LOCALE EXPO_PUBLIC_API_BASE_URL=http://TON_IP_LOCALE:3000/api docker compose up --build
```

Exemple :

```bash
EXPO_PACKAGER_HOSTNAME=10.18.72.112 EXPO_PUBLIC_API_BASE_URL=http://10.18.72.112:3000/api docker compose up --build
```

### Pourquoi il faut renseigner l'IP

Expo Go sur telephone ne peut pas utiliser `localhost`. Il faut donc exposer :

- l'adresse du serveur Expo avec `EXPO_PACKAGER_HOSTNAME`
- l'adresse du backend avec `EXPO_PUBLIC_API_BASE_URL`

Le telephone et l'ordinateur doivent etre sur le meme reseau.

### Acces utiles apres demarrage

- API backend : `http://localhost:3000`
- Swagger : `http://localhost:3000/docs`
- Adminer : `http://localhost:8080`
- MailHog : `http://localhost:8025`
- Expo DevTools : `http://localhost:19002`

### Comptes de test

Ces utilisateurs sont crees automatiquement au demarrage :

- `clientele@assurmoi.local / client123`
- `suivi@assurmoi.local / suivi123`
- `assure@assurmoi.local / assure123`
- `admin@assurmoi.local / admin123`

Le compte admin declenche en plus la verification 2FA par email.

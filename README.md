# DataFlowCI

Plateforme de gestion des flux de données avec validation de schémas, import de fichiers CSV/Excel et suivi des traitements.

## Ce que fait l'application (en 2 minutes)

DataFlowCI permet aux entreprises de :
- **Uploader des fichiers** (CSV, Excel) contenant des données
- **Valider automatiquement** les données selon des schémas définis
- **Suivre les imports** en temps réel avec des rapports détaillés
- **Gérer les rôles** (USER pour les utilisateurs, ADMIN pour la supervision)

**Workflow typique :**
1. Créer une source de données
2. Définir un schéma de validation (champs, types, contraintes)
3. Uploader un fichier CSV/Excel
4. Le système valide automatiquement chaque ligne
5. Consulter le rapport (succès/erreurs) et exporter les données valides

**Architecture :**
- **Frontend** : React + Vite + TailwindCSS (déployé sur Vercel)
- **Backend** : NestJS + Prisma + MariaDB (déployé sur Render)
- **Queue** : BullMQ + Redis pour le traitement asynchrone
- **Storage** : Fichiers uploadés (local en dev, S3 en prod)
---

## Lancer le projet en local

### Prérequis

- **Node.js** >= 18.x
- **Redis** (pour la queue BullMQ)
- **MariaDB** ou **MySQL** (base de données)
- **npm** ou **yarn**

### 1. Cloner le projet

```bash
git clone <repository-url>
cd DataFlowCI
```

### 2. Configurer la base de données

Créer une base de données MariaDB/MySQL et noter les informations de connexion.

### 3. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos informations de connexion
#
# Créer un fichier .env avec :
#
# DATABASE_URL="mysql://user:password@localhost:3306/dataflow_ci?allowPublicKeyRetrieval=true&useSSL=false"
#
# Pour ces deux variables il faut générer un JWT (https://jwtsecretkeygenerator.com/fr/)
# JWT_SECRET=""
# JWT_REFRESH_SECRET=""
#
# REDIS_HOST=
# REDIS_PORT=

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seeding : créer un admin et un user de test
npx prisma db seed

# Lancer le serveur en développement
npm run start:dev
```

Le backend sera accessible sur `https://dataflowci.onrender.com/api`

### 4. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'URL de l'API
# Créer un fichier .env avec :
# VITE_API_URL=https://dataflowci.onrender.com/api
# VITE_BASE_URL=https://dataflowci.onrender.com
# VITE_APP_NAME=DataFlowCI

# Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur `https://data-flow-ci.vercel.app`

### 5. Redis (optionnel si déjà installé)

Si vous n'avez pas Redis installé localement, vous pouvez utiliser Docker :

```bash
docker run -d -p 6379:6379 redis:alpine
```

### 6. Tester l'application

1. Ouvrir `https://data-flow-ci.vercel.app` dans le navigateur
2. S'inscrire ou se connecter avec les comptes de test (si seeding activé) :
   - **Admin** : `admin@dataflowci.com` / `Admin123!`
   - **User** : `pullo@dataflowci.com` / `User123!`
3. Créer une source, définir un schéma, uploader un fichier CSV
---

## Version déployée

- **Frontend** : [DataFlowCI Frontend](https://data-flow-ci.vercel.app)
- **Backend** : [DataFlowCI Backend](https://dataflowci.onrender.com/api)
- **API Documentation** : [Swagger UI](https://dataflowci.onrender.com/docs)

---

## 📁 Structure du projet

```
DataFlowCI/
├── backend/          # API NestJS
│   ├── src/
│   │   ├── admin/           # Routes admin (users, stats, supervision)
│   │   ├── auth/            # Authentification (JWT, refresh tokens)
│   │   ├── dashboard/      # Dashboard utilisateur
│   │   ├── export/          # Export CSV (valid rows, errors)
│   │   ├── import-jobs/     # Suivi des imports
│   │   ├── parsers/         # CSV/Excel parsers
│   │   ├── prisma/          # Client Prisma
│   │   ├── queue/           # Configuration BullMQ
│   │   ├── schemas/         # Gestion des schémas de validation
│   │   ├── sources/         # Gestion des sources de données
│   │   ├── uploads/         # Upload de fichiers
│   │   ├── validation-engine/ # Moteur de validation
│   │   └── worker/          # Worker BullMQ
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma de la base de données
│   │   └── seed.ts          # Données de test
│   └── package.json
├── frontend/         # Application React
│   ├── src/
│   │   ├── features/        # Features métier
│   │   ├── pages/           # Pages de l'application
│   │   ├── shared/          # Composants partagés
│   │   └── routes/          # Configuration du router
│   └── package.json
└── README.md
```


## 📝 Notes importantes

- **Storage local** : En développement, les fichiers uploadés sont stockés dans `backend/uploads/` (éphémère)
- **Redis requis** : La queue BullMQ nécessite Redis pour fonctionner
- **Tokens JWT** : Access token (15 min) + Refresh token (7 jours) stocké en cookie HttpOnly
- **Rôles** : Les routes admin sont protégées par le rôle `ADMIN`
---

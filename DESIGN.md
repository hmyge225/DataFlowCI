# DESIGN

## Compréhension du besoin

DataFlow CI reçoit chaque jour des fichiers CSV/Excel de multiples clients, chacun avec son propre format et ses propres règles. Le contrôle est aujourd'hui entièrement manuel (4 personnes à temps plein), sans suivi centralisé : c'est lent, coûteux, et on perd la traçabilité des imports.

L'objectif est de développer une plateforme permettant de :
- définir des schémas de validation versionnés par source/client,
- automatiser le traitement des fichiers en arrière-plan,
- produire des rapports détaillés sur chaque import,
- fournir une visibilité complète sur l'état des imports via un tableau de bord.


**Hypothèses métier :**
- Les utilisateurs ne voient que leurs propres sources et imports.
- Chaque source possède un schéma actif à un instant donné.
- Toute modification d'un schéma crée automatiquement une nouvelle version (immutabilité).
- Un import est toujours validé avec la version du schéma active au moment de l'upload.
- Les fichiers sont conservés afin de pouvoir être téléchargés ultérieurement par le client ou par un administrateur.
- Les traitements pouvant être longs (gros fichiers), ils sont exécutés de manière asynchrone pour ne pas bloquer l'utilisateur.

## Architecture

```
┌─────────────────┐
│   Frontend      │
│   (React/Vite)  │
└────────┬────────┘
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Backend       │
│   (NestJS)      │
│                 │
│  ┌───────────┐  │
│  │   Auth    │  │
│  │  Sources  │  │
│  │  Schemas  │  │
│  │  Uploads  │  │
│  │   Queue   │  │
│  └───────────┘  │
└────────┬────────┘
         │ BullMQ
         ▼
┌─────────────────┐
│   Redis         │
│   (Queue)       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Worker        │
│   (Traitement)  │
└────────┬────────┘
         │ Prisma
         ▼
┌─────────────────┐
│   MySQL/MariaDB │
└─────────────────┘
```

**Workflow métier :**

```
Utilisateur
    │
    ▼
Upload du fichier
    │
    ▼
Stockage du fichier
    │
    ▼
Création de l'ImportJob (PENDING)
    │
    ▼
Enqueue BullMQ
    │
    ▼
Worker
    │
    ▼
Parser CSV / Excel
    │
    ▼
Validation (selon le SchemaVersion active)
    │
    ▼
ImportedRows (valides / invalides)
    │
    ▼
ValidationErrors (par ligne / colonne)
    │
    ▼
ValidationReport (synthèse)
    │
    ▼
Dashboard (suivi en temps réel)
    │
    ▼
Export CSV (lignes validées)
```

## Modélisation du domaine

**Entités principales :**

- **User** : Utilisateur avec rôle (USER/ADMIN). Possède des sources et des imports.
- **Source** : Représente un client ou une source de données. Contient des versions de schéma.
- **SchemaVersion** : Définition de la structure attendue (champs, types, règles). **Immutable** : une modification crée une nouvelle version (version = max+1).
- **ImportJob** : Job d'import avec statut (PENDING, PROCESSING, SUCCESS, PARTIAL, FAILED). Lié à une source, un schéma, et un utilisateur.
- **ImportedRow** : Chaque ligne du fichier importé avec statut de validité.
- **ValidationError** : Erreurs de validation par ligne et par colonne.
- **ValidationReport** : Synthèse du traitement (total, valides, invalides).
- **RefreshToken** : Tokens de refresh pour l'authentification JWT avec rotation.

**Relations :**
- User → Sources (1:N)
- User → ImportJobs (1:N)
- Source → SchemaVersions (1:N)
- Source → ImportJobs (1:N)
- SchemaVersion → ImportJobs (1:N)
- ImportJob → ImportedRows (1:N)
- ImportedRow → ValidationErrors (1:N)
- ImportJob → ValidationReport (1:1)

**Invariants métier détaillés :**

- **Source**
  - Une Source possède au moins une version de schéma.
  - Un Source soft-deleted (`deletedAt`) n'est plus visible mais reste en base.

- **SchemaVersion**
  - Une version est immuable : elle ne peut jamais être modifiée.
  - Toute modification crée une nouvelle version.
  - Un ImportJob pointe toujours vers une version précise (jamais vers "la dernière" de manière implicite).

- **ImportJob**
  - Cycle de vie strict : `PENDING → PROCESSING → SUCCESS | PARTIAL | FAILED`.
  - Un job ne peut pas revenir en arrière dans ce cycle.

- **ImportedRow**
  - Une ligne est soit valide, soit invalide avec au moins une ValidationError associée.

- **Auth**
  - Les RefreshTokens sont stockés hashés en base (jamais en clair).

## Choix techniques

**Backend (NestJS + TypeScript)**
- NestJS pour sa structure modulaire et ses patterns SOLID
- TypeScript pour la sécurité des types, crucial quand on apprend
- Auth JWT avec refresh tokens (rotation) pour la sécurité
- Guards pour la protection des routes (auth + roles)

**Base de données (MySQL/MariaDB + Prisma)**
- MySQL/MariaDB choisi par maîtrise préalable, pour concentrer l'effort d'apprentissage sur NestJS et la logique métier plutôt que sur une nouvelle base de données
- Prisma pour la productivité : schema as code, migrations automatiques, type safety
- JSON pour les champs flexibles (fields dans SchemaVersion, data dans ImportedRow)

**Approche asynchrone (BullMQ + Redis)**
- Upload rapide : fichier stocké, job créé en PENDING, réponse immédiate
- Worker traite en arrière-plan : parsing, validation, insertion
- Redis comme broker de queue (persistant avec appendonly)
- Scalable : plusieurs workers peuvent traiter en parallèle

**Frontend (React + Vite + TanStack Query)**
- React pour l'UI component-based
- Vite pour le build ultra-rapide (important en développement itératif)
- TanStack Query pour le cache API et la gestion des états de chargement
- TailwindCSS pour le styling rapide
- Lucide React pour les icônes

**Déploiement**
- Render pour le backend (Node.js)
- Railway/Vercel pour le frontend
- Docker non utilisé pour l'environnement de déploiement, afin de concentrer le temps disponible sur les fonctionnalités métier ; le déploiement s'appuie sur des plateformes managées (Vercel, Render, Railway) qui permettent de livrer rapidement un MVP fonctionnel. Docker Compose reste utilisé localement pour Redis en développement.

## Ce qui marche, ce qui ne marche pas, ce qui manque

**Ce qui marche (aligné sur le cahier des charges) :**
- Authentification JWT avec rôles User/Admin
- Gestion des Sources
- Versionnement des Schémas (immutable)
- Suppression des Schémas pas encore liés à un fichier uploadé

- Upload de fichiers CSV/Excel
- Traitement asynchrone (BullMQ)

- Rapport d'import (ValidationReport)
- Stockage local des fichiers uploadés
- Tests e2e
- API documentation avec Swagger 
- Dashboard de suivi des imports

**Ce qui ne marche pas / limites :**
- Validation par schéma configurable
- Export des lignes valides (CSV)
- Pas de nettoyage automatique des vieux fichiers
- Pas de monitoring des jobs (Bull Board non implémenté)
- UI basique, pas de design system complet (juste des variables pour les couleurs)

**Ce qui manque :**
- Notifications email/SMS pour les erreurs
- Dashboard de monitoring technique (jobs/queue)
- Gestion des gros fichiers (>20MB)
- Retry automatique des jobs échoués

## Trade-offs assumés

**Stockage local vs S3**
- Sacrifié : S3/GCS pour le stockage des fichiers
- Pourquoi : Complexité de configuration supplémentaire, temps limité
- Impact : Pas de scalabilité horizontale, perte de données si serveur down

**Tests vs Fonctionnalités**
- Sacrifié : Tests unitaires
- Pourquoi : Focus sur le MVP fonctionnel
- Impact : Risque de régressions, confiance moindre dans les modifications

**UI simplifiée vs Design system**
- Sacrifié : Design system complet, animations avancées
- Pourquoi : Focus sur le backend et la logique métier
- Impact : UX moins soignée, mais fonctionnelle

**Docker vs Plateformes managées**
- Sacrifié : Conteneurisation complète de l'application (backend/frontend)
- Pourquoi : Docker n'a pas été utilisé afin de concentrer le temps disponible sur les fonctionnalités métier ; le déploiement s'appuie sur des plateformes managées (Vercel, Render, Railway) qui permettent de livrer rapidement un MVP fonctionnel
- Impact : Portabilité et reproductibilité de l'environnement moindres, mais gain de temps significatif sur la partie infrastructure

## Next steps

Avec 2 semaines supplémentaires, priorité aux fonctionnalités explicitement demandées dans le sujet, puis aux améliorations bonus :

**Fonctionnalités attendues par le sujet :**
1. **Refactorisation** : revoir les fonctions, composants et autres fichiers qui ne sont pas conforme avec l'architecture, les adaptés et simplifier certaines parties

2. **Tests** : Tests unitaires pour ValidationEngineService et les parsers, tests e2e sur les routes critiques
3. **CI/CD** : Pipeline d'intégration et de déploiement continu

4. **Stockage cloud** : Migrer vers S3/GCS pour les fichiers uploadés
5. **Retry** : Implémenter le retry automatique des jobs échoués
6. **Optimisations** : Gestion des gros fichiers (>20MB), cleanup automatique, dashboard de monitoring technique
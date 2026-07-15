# Plan d'implémentation — DataFlow CI (Ingestion & Validation de données)

> Document destiné à être exécuté par un agent IA (ex: Claude Code) étape par étape.
> Chaque phase doit être terminée, testée et validée avant de passer à la suivante.
> Ne pas paralléliser les phases — les dépendances sont strictes.
>
> **⚠️ Règle Git impérative** : à la fin de CHAQUE phase, l'agent doit s'arrêter et attendre
> une confirmation explicite de l'utilisateur avant de passer à la phase suivante. L'agent
> ne doit jamais commit, ni créer/checkout une branche automatiquement — voir section 17
> pour le détail du workflow.

---

## 0. Contexte fonctionnel

Deux rôles :

- **User** (client) : gère uniquement ses propres données — Sources, Schemas, Uploads, ImportJobs, Rapports, Exports (valides + erreurs), Dashboard personnel.
- **Admin** (équipe DataFlow CI) : supervision globale — tous les users, toutes les sources/schemas/imports, statistiques plateforme, téléchargement du fichier original + exports + rapports de n'importe quel import, pour le support.

Règle métier critique : **un SchemaVersion n'est jamais modifié une fois créé**. Toute modification crée une nouvelle version. Un ImportJob reste toujours lié à la version de schéma utilisée au moment de l'import.

---

## 1. Structure des dossiers

### Backend
```
modules/
  auth/
  users/
  sources/
  schemas/
  ingestion/
    upload/
    parser/
    validator/
    queue/
    worker/
    report/
    export/
  dashboard/
  admin/
```

### Frontend
```
features/
  auth/
  sources/
  schemas/
  uploads/
  reports/
  dashboard/
  admin/
    users/
    supervision/
    stats/
```

Rappel architecture front : un `Context + useReducer` par feature (pas de store global monolithique), ou Zustand si state partagé cross-feature (ex: session utilisateur, rôle courant).

---

## 2. Modèle de données (Prisma) — Phase 1

**But** : poser toutes les tables et relations avant tout code métier.

### Entités minimales
- `User` (id, email, password, role: `USER | ADMIN`, createdAt)
- `Source` (id, userId, name, description, isActive, createdAt)
- `SchemaVersion` (id, sourceId, version:int, fields:JSON, createdAt) — **immutable après création**
- `ImportJob` (id, sourceId, schemaVersionId, userId, status: `PENDING|PROCESSING|SUCCESS|PARTIAL|FAILED`, filepath, originalFilename, createdAt, startedAt, finishedAt)
- `ImportedRow` (id, importJobId, rowIndex, data:JSON, isValid:boolean)
- `ValidationError` (id, importedRowId, column, message)
- `ValidationReport` (id, importJobId, total, validCount, invalidCount, createdAt)

### Relations
- User 1—N Source
- Source 1—N SchemaVersion
- Source 1—N ImportJob
- ImportJob 1—N ImportedRow
- ImportJob 1—1 ValidationReport
- ImportedRow 1—N ValidationError

### Tâches
- [ ] Écrire `schema.prisma` complet avec enums (`Role`, `ImportStatus`)
- [ ] Ajouter les index utiles (`sourceId`, `importJobId`, `userId`, `status`)
- [ ] Générer la migration initiale
- [ ] Vérifier les cascades de suppression (ex: supprimer une Source → que devient l'historique des imports ? recommandé : soft delete ou interdiction si imports existants)
- [ ] Seed minimal (1 admin, 1 user de test)

**Critère de sortie** : `npx prisma studio` affiche toutes les tables et relations correctement. Ne pas toucher au Worker avant cette étape validée.

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-db-schema`. Attendre commit/review avant de continuer.

---

## 3. Auth & gestion des rôles — Phase 2

### Backend
- [ ] Auth JWT (login, refresh token, hash password avec bcrypt/argon2)
- [ ] Guard/Middleware `RolesGuard` avec décorateur `@Roles('ADMIN')`
- [ ] Endpoint `GET /me` retournant `{ id, email, role }`
- [ ] Toutes les routes `User` doivent filtrer automatiquement par `userId` (jamais faire confiance à un `sourceId` fourni côté client sans vérifier l'ownership)
- [ ] Toutes les routes `Admin` doivent être protégées par le guard `ADMIN`

### Frontend
- [ ] `features/auth` : login, gestion du token, hook `useAuth()`
- [ ] Routing conditionnel selon le rôle (layout `User` vs layout `Admin`)
- [ ] Route guard côté front (redirection si rôle insuffisant)

**Critère de sortie** : un User ne peut jamais accéder aux données d'un autre user, même en modifiant les IDs dans les requêtes (tester explicitement ce cas).

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-auth-roles`. Attendre commit/review avant de continuer.

---

## 4. Sources — Phase 3

### Backend (`modules/sources`)
- [ ] `POST /sources` (User uniquement, scope à son propre userId)
- [ ] `GET /sources` (User : les siennes / Admin : toutes, avec filtre `?userId=`)
- [ ] `GET /sources/:id`
- [ ] `PATCH /sources/:id`
- [ ] `DELETE /sources/:id` (soft delete recommandé si des imports existent)
- [ ] Vérification ownership sur chaque route User

### Frontend (`features/sources`)
- [ ] Liste des sources (table avec statut actif/inactif)
- [ ] Formulaire création
- [ ] Détail source → CTA "Créer un schéma" si aucun schéma actif
- [ ] Vue Admin : liste globale avec colonne "propriétaire"

**UX** : à la création d'une Source, rediriger immédiatement vers la création du premier SchemaVersion. Bloquer l'upload tant qu'aucun schéma actif n'existe (message explicite, pas un bouton désactivé silencieux).

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-sources`. Attendre commit/review avant de continuer.

---

## 5. Schema Versions — Phase 4

### Backend (`modules/schemas`)
- [ ] `POST /sources/:id/schemas` → crée automatiquement version = 1 si première, sinon version = max+1
- [ ] `GET /sources/:id/schemas` (historique complet)
- [ ] `GET /sources/:id/schemas/:version`
- [ ] Aucune route `PATCH` sur un SchemaVersion existant — uniquement création de nouvelle version
- [ ] Validation du format du schéma envoyé (structure des `fields`, types autorisés : required, pattern, enum, min, max, date, string, integer, row_constraints)

### Frontend (`features/schemas`)
- [ ] Éditeur de schéma (builder de champs : nom, type, règles de validation)
- [ ] Historique des versions (lecture seule pour les anciennes)
- [ ] Bandeau clair : "Créer une nouvelle version" plutôt que "Modifier" — éviter toute ambiguïté UX sur l'immutabilité
- [ ] Comparateur de versions (diff visuel) — utile mais optionnel, à faire si temps disponible

**Critère de sortie** : un import déjà lancé avec la Version 1 continue de référencer la Version 1 même après création de la Version 2. Tester explicitement.

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-schema-versions`. Attendre commit/review avant de continuer.

---

## 6. ValidationEngine — Phase 5 (avant BullMQ)

### Backend (`modules/ingestion/validator`)
- [ ] Service pur `ValidationEngine.validate(schema, row): ValidationError[]`
- [ ] Règles supportées : `required`, `pattern`, `enum`, `min`, `max`, `date`, `string`, `integer`, `row_constraints`
- [ ] Tests unitaires avec objets JS bruts (aucune dépendance à la DB, au fichier, ou à BullMQ)
- [ ] Gestion des erreurs multiples par colonne et par ligne

**Critère de sortie** : 100% testable en isolation, exécuté et validé avant toute intégration au Worker.

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-validation-engine`. Attendre commit/review avant de continuer.

---

## 7. Upload — Phase 6

### Backend (`modules/ingestion/upload`)
- [ ] `POST /sources/:id/uploads` (Multer ou équivalent)
- [ ] Vérification extension (`.csv`, `.xlsx`, `.xls`)
- [ ] Vérification taille max (définir une limite, ex: 20 Mo)
- [ ] Stockage (local pour dev, penser à un adaptateur pour S3/équivalent en prod)
- [ ] Création `ImportJob` (status `PENDING`)
- [ ] `queue.add()` avec `{ importJobId, sourceId, schemaVersionId, filepath }` (jamais le fichier lui-même)
- [ ] Retour `202 Accepted` immédiat — le contrôleur ne lit jamais le fichier

### Frontend (`features/uploads`)
- [ ] Sélecteur de Source + SchemaVersion active
- [ ] Drag & drop / input fichier avec validation client (extension, taille) avant envoi
- [ ] Affichage immédiat du statut `PENDING` après upload, avec polling ou websocket vers le statut du job

**UX** : ne jamais bloquer l'utilisateur pendant le traitement — il doit pouvoir naviguer ailleurs et revenir suivre l'avancement.

---

## 8. ImportJob & file d'attente — Phase 7

### Backend (`modules/ingestion/queue`)
- [ ] Redis + BullMQ configurés
- [ ] Queue `imports`
- [ ] Endpoint `GET /import-jobs/:id` (statut en temps réel)
- [ ] Endpoint `GET /import-jobs?sourceId=` (historique)
- [ ] (Optionnel mais recommandé) WebSocket ou SSE pour push du changement de statut au front, plutôt que polling pur

### Frontend (`features/uploads` + `features/reports`)
- [ ] Vue "Suivi des imports" avec badges de statut (`Pending`, `Processing`, `Success`, `Partial`, `Failed`)
- [ ] Rafraîchissement auto (polling ~3-5s ou websocket)

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-upload-queue` (couvre Upload + ImportJob/Queue). Attendre commit/review avant de continuer.

---

## 9. Worker & Parsers — Phase 8-10

### Backend (`modules/ingestion/worker`, `parser`)
- [ ] `OnJob()` : lire ImportJob → passer status à `PROCESSING`
- [ ] `CsvParserService` et `ExcelParserService`, retournant tous deux le même format `[{...}]`
- [ ] Le Worker ne connaît jamais le type de fichier source — délégation totale au Parser
- [ ] Pour chaque ligne : `Parser → ValidationEngine → ImportedRow (+ ValidationError si invalide)`
- [ ] Gestion des erreurs techniques (fichier corrompu, colonnes manquantes) → status `FAILED` avec message clair, pas un crash silencieux
- [ ] Traitement par batch/stream si gros fichiers (éviter de tout charger en mémoire)

**Critère de sortie** : uploader un CSV valide, un CSV avec erreurs mixtes, et un fichier corrompu → vérifier les 3 statuts finaux (`SUCCESS`, `PARTIAL`, `FAILED`).

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-worker-parsers`. Attendre commit/review avant de continuer.

---

## 10. Rapport de validation — Phase 11

### Backend (`modules/ingestion/report`)
- [ ] Calcul `total`, `validCount`, `invalidCount` à la fin du traitement
- [ ] Création `ValidationReport`
- [ ] Mise à jour finale du statut `ImportJob` (`SUCCESS` / `PARTIAL` / `FAILED`)
- [ ] `GET /import-jobs/:id/report` (détail complet avec liste des erreurs paginée)

### Frontend (`features/reports`)
- [ ] Vue rapport : résumé chiffré (total/valides/invalides, %) + tableau des erreurs (ligne, colonne, message)
- [ ] Filtre/recherche dans les erreurs si volume important
- [ ] Pagination côté serveur si beaucoup de lignes invalides

---

## 11. Export — Phase 12

### Backend (`modules/ingestion/export`)
- [ ] `GET /import-jobs/:id/export/valid` → régénère un CSV depuis `ImportedRow WHERE isValid = true` (ne jamais relire le fichier original)
- [ ] `GET /import-jobs/:id/export/errors` → export du rapport d'erreurs (CSV ou PDF selon besoin)
- [ ] **Admin uniquement** : `GET /import-jobs/:id/export/original` → téléchargement du fichier original stocké (support/diagnostic)
- [ ] Vérification ownership : un User ne peut exporter que ses propres ImportJobs

### Frontend
- [ ] Boutons "Télécharger les lignes valides" / "Télécharger le rapport d'erreurs" sur la vue rapport (User)
- [ ] Bouton supplémentaire "Télécharger le fichier original" visible uniquement côté Admin

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-report-export` (couvre Rapport + Export). Attendre commit/review avant de continuer.

---

## 12. Dashboard User — Phase 13

### Backend (`modules/dashboard`)
- [ ] `DashboardService` : lit uniquement MySQL, jamais les fichiers
- [ ] `GET /dashboard` (User, scope à ses propres données) : nb imports, taux de succès/échec, top sources, temps moyen de traitement, imports par jour

### Frontend (`features/dashboard`)
- [ ] Cards indicateurs clés (KPIs)
- [ ] Graphique imports par jour (courbe ou barres)
- [ ] Répartition succès/partiel/échec (donut)
- [ ] Liste "sources les plus actives"

> 🛑 **Point d'arrêt** — Branche `feature/ingestion-dashboard`. Attendre commit/review avant de continuer.

---

## 13. Espace Admin — Phase 14

### Backend (`modules/admin`)
- [ ] `GET /admin/users` (liste, recherche, filtres)
- [ ] `PATCH /admin/users/:id` (activer/désactiver, changer rôle)
- [ ] `GET /admin/sources` / `GET /admin/schemas` / `GET /admin/import-jobs` (vue globale, tous users, avec filtres par user/source/statut/date)
- [ ] `GET /admin/stats` : nb imports global, taux succès global, top sources, top users, temps moyen de traitement, volume de données traitées, historique/tendance
- [ ] Toutes les routes protégées par `RolesGuard('ADMIN')`

### Frontend (`features/admin`)
- [ ] `admin/users` : table des utilisateurs, actions (activer/désactiver)
- [ ] `admin/supervision` : vue globale des sources/schemas/imports de tous les clients, avec filtres et recherche
- [ ] `admin/stats` : dashboard plateforme (mêmes types de graphes que le dashboard User mais agrégés + top users/sources)
- [ ] Accès aux 3 téléchargements (original, valides, erreurs) depuis la vue détail d'un ImportJob

**UX Admin** : privilégier une table dense + filtres (statut, user, source, date) plutôt que des cards, car le volume de données est plus important que côté User.

> 🛑 **Point d'arrêt final** — Branche `feature/ingestion-admin-panel`. Une fois cette phase committée et review, toutes les sous-branches peuvent être mergées manuellement dans `feature/data-ingestion-pipeline`, qui devient à son tour la branche proposée en Pull Request vers `main`/`develop`.

---

## 14. Ordre d'exécution recommandé pour l'agent

1. Prisma schema complet + migrations
2. Auth + rôles + guards
3. CRUD Source
4. CRUD SchemaVersion (avec immutabilité)
5. ValidationEngine (tests isolés, sans BullMQ)
6. Upload (Multer + stockage)
7. ImportJob (statuts + endpoints)
8. BullMQ + Redis
9. Worker (squelette, sans parser d'abord)
10. CsvParserService
11. ExcelParserService
12. Intégration Worker + ValidationEngine
13. ImportedRows + ValidationErrors + ValidationReport
14. Export (valides + erreurs + original pour Admin)
15. Dashboard User
16. Espace Admin (users, supervision, stats)
17. Front : brancher toutes les features dans l'ordre Source → Schema → Upload → Rapport → Dashboard → Admin

---

## 15. Principes transverses (à rappeler à l'agent à chaque phase)

- **SRP strict** : UploadService, Worker, ParserService, ValidationEngine, ReportService, ExportService, DashboardService restent séparés — aucune fusion de responsabilités.
- **Ownership systématique** : toute route User doit vérifier que la ressource appartient bien à l'utilisateur authentifié.
- **Jamais de fichier en mémoire côté contrôleur** : le contrôleur d'upload ne lit jamais le contenu du fichier.
- **Immutabilité des SchemaVersion** : aucune route `PATCH`/`PUT` ne doit exister sur une version existante.
- **Testabilité** : ValidationEngine et Parsers doivent être testables sans DB ni queue.
- **Statuts explicites côté UI** : ne jamais laisser un état de chargement ambigu — toujours afficher `Pending/Processing/Success/Partial/Failed` clairement.
- **Frontend** : Context + useReducer par feature, pas de store global monolithique ; Zustand si besoin de state partagé cross-feature (session, rôle).

---

## 16. Definition of Done par phase

Chaque phase n'est considérée terminée que si :
- [ ] Le code respecte la structure de dossiers définie
- [ ] Les tests unitaires (au minimum ValidationEngine + Parsers) passent
- [ ] Les routes sont protégées par les bons guards (User/Admin/ownership)
- [ ] Un test manuel end-to-end de la phase a été effectué
- [ ] Aucune régression sur les phases précédentes

---

## 17. Workflow Git — découpage par branches et points d'arrêt

### Arborescence des branches

```
feature/data-ingestion-pipeline          <- branche parente (intégration)
  ├── feature/ingestion-db-schema        <- Phase 1 (Prisma)
  ├── feature/ingestion-auth-roles       <- Phase 2
  ├── feature/ingestion-sources          <- Phase 3
  ├── feature/ingestion-schema-versions  <- Phase 4
  ├── feature/ingestion-validation-engine<- Phase 5
  ├── feature/ingestion-upload-queue     <- Phase 6-8
  ├── feature/ingestion-worker-parsers   <- Phase 9-10
  ├── feature/ingestion-report-export    <- Phase 11-12
  ├── feature/ingestion-dashboard        <- Phase 13
  └── feature/ingestion-admin-panel      <- Phase 14
```

### Mapping section du plan → branche

| Section(s) du document | Contenu | Branche |
|---|---|---|
| §2 | Modèle de données (Prisma) | `feature/ingestion-db-schema` |
| §3 | Auth & gestion des rôles | `feature/ingestion-auth-roles` |
| §4 | Sources | `feature/ingestion-sources` |
| §5 | Schema Versions | `feature/ingestion-schema-versions` |
| §6 | ValidationEngine | `feature/ingestion-validation-engine` |
| §7 + §8 | Upload + ImportJob & file d'attente (BullMQ) | `feature/ingestion-upload-queue` |
| §9 | Worker & Parsers (CSV/Excel) | `feature/ingestion-worker-parsers` |
| §10 + §11 | Rapport de validation + Export | `feature/ingestion-report-export` |
| §12 | Dashboard User | `feature/ingestion-dashboard` |
| §13 | Espace Admin | `feature/ingestion-admin-panel` |

### Règle de fonctionnement pour l'agent

1. Avant de commencer une phase, l'agent **crée (ou checkout si déjà existante) la branche correspondante** à partir de `feature/data-ingestion-pipeline`, et l'annonce explicitement :
   > "Je passe sur la branche `feature/xxx` pour démarrer la Phase N."
2. L'agent développe **uniquement** le périmètre de la phase en cours — pas d'anticipation sur la phase suivante.
3. Une fois la Definition of Done de la phase validée (section 16), l'agent **s'arrête** et affiche un message de type :
   > "✅ Phase N terminée sur `feature/xxx`. Merci de review et commit. Dis-moi quand je peux passer à la Phase N+1 (`feature/yyy`)."
4. L'agent **n'exécute jamais** `git commit`, `git push`, ni de merge/PR de lui-même — ces actions restent manuelles, sous ton contrôle.
5. Une fois plusieurs sous-branches terminées et mergées manuellement dans `feature/data-ingestion-pipeline`, c'est cette branche parente qui est proposée en Pull Request vers `main`/`develop`.

### Convention de commit (à l'intérieur d'une phase)

Pour permettre des commits atomiques même au sein d'une phase, préfixer avec le scope :

```
feat(ingestion-db): ajoute le schema Prisma complet + migrations
feat(ingestion-auth): ajoute RolesGuard et endpoint /me
test(ingestion-validation): ajoute les tests unitaires ValidationEngine
```

### Rappel visuel des points d'arrêt

Un bloc `> 🛑 **Point d'arrêt**` a été inséré directement dans les sections 2 à 13 du document, à la fin de chaque groupe correspondant à une branche (voir tableau ci-dessus). L'agent doit s'arrêter précisément à ces marqueurs, même si plusieurs sections consécutives partagent la même branche (ex: §7+§8, ou §10+§11) — dans ce cas, il n'y a qu'un seul point d'arrêt à la fin du groupe, pas un par section.

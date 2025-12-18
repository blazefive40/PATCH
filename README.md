# 🔒 IPSSI PATCH - Secured Web Application

Une application web full-stack sécurisée utilisant Docker, PostgreSQL, Sequelize ORM et une architecture en couches.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Architecture](#architecture)
- [Améliorations de sécurité](#améliorations-de-sécurité)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Structure du projet](#structure-du-projet)
- [API Endpoints](#api-endpoints)
- [Variables d'environnement](#variables-denvironnement)

## 🎯 Vue d'ensemble

Cette application a été complètement refactorisée et sécurisée avec :

- ✅ **Conteneurisation Docker** de tous les services
- ✅ **Architecture en couches** (Services & Controllers)
- ✅ **PostgreSQL** avec connexions sécurisées
- ✅ **Sequelize ORM** pour prévenir les injections SQL
- ✅ **Validation des entrées** avec express-validator
- ✅ **Protection XSS** avec sanitisation du contenu
- ✅ **Headers de sécurité** avec Helmet

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   React App     │ Port 3000
│   (Nginx)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Backend       │
│   Express API   │ Port 8000
│   (Node.js)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│   PostgreSQL    │ Port 5432
└─────────────────┘
```

### Couches Backend

```
backend/
├── src/
│   ├── config/          # Configuration DB
│   ├── controllers/     # Gestion des requêtes HTTP
│   ├── services/        # Logique métier
│   ├── models/          # Modèles Sequelize ORM
│   ├── middlewares/     # Validators & middlewares
│   ├── routes/          # Définition des routes
│   └── server.js        # Point d'entrée
```

## 🛡️ Améliorations de sécurité

### Vulnérabilités corrigées

#### 1. **Injection SQL** ❌ → ✅
**Avant :**
```javascript
db.run(`INSERT INTO users (name) VALUES ('${fullName}')`)
db.all(req.body) // Requête SQL directe depuis l'utilisateur
```

**Après :**
```javascript
// Utilisation de Sequelize ORM avec requêtes paramétrées
await User.create({ name: fullName });
await User.findByPk(userId);
```

#### 2. **Cross-Site Scripting (XSS)** ❌ → ✅
**Avant :**
```javascript
// Aucune sanitisation du contenu
await Comment.create({ content: req.body });
```

**Après :**
```javascript
// Sanitisation avec la librairie xss
const sanitizedContent = xss(content);
await Comment.create({ content: sanitizedContent });
```

#### 3. **Validation des entrées** ❌ → ✅
**Avant :**
```javascript
// Aucune validation
const userId = req.body;
```

**Après :**
```javascript
// Validation avec express-validator
validateUserId: [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer')
]
```

#### 4. **Exposition de credentials** ❌ → ✅
**Avant :**
```javascript
// Credentials en dur dans le code
const db = new sqlite3.Database('./database.db');
```

**Après :**
```javascript
// Variables d'environnement
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  { /* ... */ }
);
```

## 🚀 Technologies

### Backend
- **Node.js** - Runtime JavaScript
- **Express 5** - Framework web
- **Sequelize** - ORM pour PostgreSQL
- **PostgreSQL** - Base de données relationnelle
- **Helmet** - Headers de sécurité HTTP
- **express-validator** - Validation des entrées
- **xss** - Protection contre les attaques XSS
- **dotenv** - Gestion des variables d'environnement

### Frontend
- **React 19** - Bibliothèque UI
- **Axios** - Client HTTP
- **Nginx** - Serveur web pour la production

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration multi-conteneurs

## 📦 Prérequis

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git**

## 🔧 Installation et démarrage

### Méthode 1 : Avec Docker (Recommandé)

1. **Cloner le repository**
```bash
git clone git@github.com:blazefive40/PATCH.git
cd PATCH
```

2. **Créer les fichiers .env**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/my-app/.env.example frontend/my-app/.env
```

3. **Démarrer tous les services avec Docker Compose**
```bash
docker-compose up --build
```

4. **Accéder à l'application**
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- PostgreSQL : localhost:5432

5. **Peupler la base de données**
Visitez http://localhost:8000/populate pour générer 3 utilisateurs aléatoires.

### Méthode 2 : Développement local (Sans Docker)

#### Backend

1. **Installer PostgreSQL localement**

2. **Configurer le backend**
```bash
cd backend
npm install
```

3. **Créer le fichier .env**
```bash
cp .env.example .env
# Modifier les variables DB_HOST, DB_PORT, etc.
```

4. **Démarrer le backend**
```bash
npm run dev
```

#### Frontend

1. **Installer et démarrer**
```bash
cd frontend/my-app
npm install
npm start
```

## 📁 Structure du projet

```
PATCH/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Configuration Sequelize
│   │   ├── controllers/
│   │   │   ├── userController.js   # Controller utilisateurs
│   │   │   └── commentController.js # Controller commentaires
│   │   ├── services/
│   │   │   ├── userService.js      # Service utilisateurs
│   │   │   └── commentService.js   # Service commentaires
│   │   ├── models/
│   │   │   ├── User.js             # Modèle User
│   │   │   ├── Comment.js          # Modèle Comment
│   │   │   └── index.js            # Export des modèles
│   │   ├── middlewares/
│   │   │   └── validators.js       # Validateurs express-validator
│   │   ├── routes/
│   │   │   └── index.js            # Définition des routes
│   │   └── server.js               # Point d'entrée
│   ├── .env                        # Variables d'environnement
│   ├── .env.example                # Template des variables
│   ├── Dockerfile                  # Image Docker backend
│   └── package.json                # Dépendances npm
│
├── frontend/
│   └── my-app/
│       ├── src/
│       │   ├── App.js              # Composant principal
│       │   └── ...
│       ├── public/
│       ├── .env                    # Variables d'environnement
│       ├── .env.example            # Template des variables
│       ├── Dockerfile              # Image Docker frontend
│       ├── nginx.conf              # Configuration Nginx
│       └── package.json            # Dépendances npm
│
├── docker-compose.yml              # Orchestration Docker
├── .gitignore                      # Fichiers ignorés par Git
└── README.md                       # Ce fichier
```

## 🌐 API Endpoints

### Users

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/populate` | Génère 3 utilisateurs aléatoires | - |
| GET | `/users` | Liste tous les IDs utilisateurs | - |
| POST | `/user` | Récupère un utilisateur par ID | `{ "userId": 1 }` |

### Comments

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| GET | `/comments` | Liste tous les commentaires | - |
| POST | `/comment` | Crée un nouveau commentaire | `"Votre commentaire"` (text/plain) |
| GET | `/comments/:id` | Récupère un commentaire par ID | - |
| DELETE | `/comments/:id` | Supprime un commentaire | - |

### Health

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Vérifie l'état du serveur |

## 🔐 Variables d'environnement

### Backend (.env)

```env
# Server
PORT=8000
NODE_ENV=production

# Database
DB_HOST=postgres          # Ou localhost en dev local
DB_PORT=5432
DB_NAME=ipssi_patch
DB_USER=admin
DB_PASSWORD=securepassword123

# CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000
```

## 🧪 Tests

### Test manuel avec curl

```bash
# Health check
curl http://localhost:8000/health

# Générer des utilisateurs
curl http://localhost:8000/populate

# Lister les utilisateurs
curl http://localhost:8000/users

# Requête d'un utilisateur
curl -X POST http://localhost:8000/user \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Créer un commentaire
curl -X POST http://localhost:8000/comment \
  -H "Content-Type: text/plain" \
  -d "Mon commentaire"

# Lister les commentaires
curl http://localhost:8000/comments
```

## 🐳 Commandes Docker utiles

```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Supprimer les volumes (attention : efface la DB)
docker-compose down -v

# Rebuild après modifications
docker-compose up --build

# Accéder au container backend
docker exec -it ipssi_patch_backend sh

# Accéder à PostgreSQL
docker exec -it ipssi_patch_postgres psql -U admin -d ipssi_patch
```

## 📊 Comparaison Avant/Après

| Aspect | Avant | Après |
|--------|-------|-------|
| Database | SQLite (fichier local) | PostgreSQL (conteneurisé) |
| ORM | Requêtes SQL brutes | Sequelize ORM |
| Architecture | Monolithique (server.js) | Couches séparées (MVC) |
| Sécurité SQL | ❌ Injections possibles | ✅ Requêtes paramétrées |
| Sécurité XSS | ❌ Pas de protection | ✅ Sanitisation xss |
| Validation | ❌ Aucune | ✅ express-validator |
| Deployment | Manuel | Docker Compose |
| Variables sensibles | ❌ En dur dans le code | ✅ Variables d'environnement |
| Headers sécurité | ❌ Aucun | ✅ Helmet |

## 👥 Auteurs

- **blazefive40** - [GitHub](https://github.com/blazefive40)

## 📝 License

ISC

---

🤖 Projet refactorisé avec [Claude Code](https://claude.com/claude-code)

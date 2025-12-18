# 🚀 Guide de Démarrage Rapide

## Option 1 : Docker (Recommandé)

### Prérequis
Installer **Docker Desktop** : https://www.docker.com/products/docker-desktop/

### Étapes

1. **Démarrer tous les services**
```bash
docker-compose up --build
```

2. **Attendre que tous les services soient prêts** (~2-3 minutes)
   - ✅ PostgreSQL : Ready to accept connections
   - ✅ Backend : Server is running on port 8000
   - ✅ Frontend : Nginx started

3. **Accéder à l'application**
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000

4. **Générer des utilisateurs de test**
   - Cliquez sur le lien `/populate` dans l'interface
   - Ou visitez : http://localhost:8000/populate

5. **Tester l'application**
   - Requête utilisateur par ID
   - Poster des commentaires
   - Vérifier la protection XSS

### Commandes utiles

```bash
# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Supprimer tout (y compris la DB)
docker-compose down -v
```

---

## Option 2 : Développement Local (Sans Docker)

### Prérequis
- **Node.js** 20+ : https://nodejs.org/
- **PostgreSQL** : https://www.postgresql.org/download/

### Étape 1 : Configurer PostgreSQL

```sql
-- Se connecter à PostgreSQL
psql -U postgres

-- Créer la base de données
CREATE DATABASE ipssi_patch;

-- Créer l'utilisateur
CREATE USER admin WITH PASSWORD 'securepassword123';

-- Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE ipssi_patch TO admin;
```

### Étape 2 : Configurer le Backend

```bash
cd backend

# Installer les dépendances
npm install

# Modifier .env
# Changer DB_HOST=postgres en DB_HOST=localhost
```

### Étape 3 : Démarrer le Backend

```bash
cd backend
npm run dev
```

Le backend devrait démarrer sur http://localhost:8000

### Étape 4 : Configurer le Frontend

```bash
cd frontend/my-app

# Installer les dépendances
npm install
```

### Étape 5 : Démarrer le Frontend

```bash
cd frontend/my-app
npm start
```

Le frontend devrait s'ouvrir automatiquement sur http://localhost:3000

---

## ✅ Vérification

### Backend

```bash
# Health check
curl http://localhost:8000/health

# Devrait retourner : {"status":"ok","message":"Server is running"}
```

### Test de sécurité

1. **Protection contre SQL Injection**
   - Essayez d'entrer : `1 OR 1=1` dans le champ User ID
   - ✅ Devrait retourner une erreur de validation

2. **Protection XSS**
   - Essayez de poster : `<script>alert('XSS')</script>` dans les commentaires
   - ✅ Le script devrait être échappé et affiché comme texte

---

## 🐛 Dépannage

### Port déjà utilisé

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### Erreur de connexion PostgreSQL

```bash
# Vérifier que PostgreSQL est démarré
# Windows (Services)
services.msc

# Linux
sudo systemctl status postgresql

# Mac
brew services list
```

### Erreur Docker "port already allocated"

```bash
docker-compose down
# Attendre 10 secondes
docker-compose up
```

---

## 📊 Endpoints API

### Tester avec curl

```bash
# Générer des utilisateurs
curl http://localhost:8000/populate

# Lister les utilisateurs
curl http://localhost:8000/users

# Requête utilisateur
curl -X POST http://localhost:8000/user \
  -H "Content-Type: application/json" \
  -d '{"userId": 1}'

# Créer un commentaire
curl -X POST http://localhost:8000/comment \
  -H "Content-Type: text/plain" \
  -d "Mon premier commentaire sécurisé!"

# Lister les commentaires
curl http://localhost:8000/comments
```

---

## 🎓 Architecture

```
Frontend (React)  →  Backend (Express)  →  Database (PostgreSQL)
    :3000               :8000                  :5432
```

### Flux de données

1. **Frontend** envoie une requête HTTP
2. **Routes** reçoivent la requête
3. **Validators** valident les données
4. **Controllers** traitent la requête
5. **Services** appliquent la logique métier
6. **Models (ORM)** interagissent avec la DB
7. **PostgreSQL** stocke les données

---

## 🔐 Sécurité

✅ Toutes les vulnérabilités ont été corrigées :

- **SQL Injection** : Sequelize ORM avec requêtes paramétrées
- **XSS** : Sanitisation avec librairie `xss`
- **Validation** : `express-validator` sur toutes les entrées
- **CORS** : Configuré pour accepter uniquement le frontend
- **Headers** : Helmet pour les headers de sécurité HTTP
- **Credentials** : Variables d'environnement

---

Besoin d'aide ? Consultez le [README.md](./README.md) complet.

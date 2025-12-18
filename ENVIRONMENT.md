# 🔐 Environment Variables Security Guide

This document explains all environment variables used in the IPSSI_PATCH application and their security implications.

## 📋 Table of Contents

- [Backend Variables](#backend-variables)
- [Frontend Variables](#frontend-variables)
- [Security Best Practices](#security-best-practices)
- [Production Deployment](#production-deployment)
- [Docker Configuration](#docker-configuration)

## 🔧 Backend Variables

### Location
`backend/.env` (create from `backend/.env.example`)

### Variables

#### `PORT`
- **Type:** Integer
- **Default:** `8000`
- **Description:** Port on which the Express server listens
- **Security Impact:** Low
- **Production:** Use any available port (commonly 8000, 3000, or 80/443 with reverse proxy)

#### `NODE_ENV`
- **Type:** String (`development` | `production`)
- **Default:** `development`
- **Description:** Environment mode
- **Security Impact:** ⚠️ **HIGH**
- **Production:** **MUST** be set to `production`
- **Why:** Controls error verbosity, stack traces, and debug logging
- **Impact:**
  - `development`: Shows detailed error messages and stack traces
  - `production`: Hides error details to prevent information disclosure

#### `DB_HOST`
- **Type:** String
- **Default:** `postgres` (Docker) or `localhost` (local)
- **Description:** PostgreSQL server hostname
- **Security Impact:** Medium
- **Production:** Use internal hostname or IP (never expose publicly)
- **Docker:** Use service name from docker-compose.yml (`postgres`)

#### `DB_PORT`
- **Type:** Integer
- **Default:** `5432`
- **Description:** PostgreSQL server port
- **Security Impact:** Low
- **Production:** Default PostgreSQL port, can be changed for obscurity

#### `DB_NAME`
- **Type:** String
- **Default:** `ipssi_patch`
- **Description:** PostgreSQL database name
- **Security Impact:** Low
- **Production:** Use a unique name per environment

#### `DB_USER`
- **Type:** String
- **Default:** `admin`
- **Description:** PostgreSQL username
- **Security Impact:** ⚠️ **MEDIUM**
- **Production:** Change from default `admin` or `postgres`
- **Recommendation:** Use application-specific username (e.g., `ipssi_app_user`)

#### `DB_PASSWORD`
- **Type:** String
- **Default:** `securepassword123`
- **Description:** PostgreSQL user password
- **Security Impact:** ⚠️ **CRITICAL**
- **Production:** **MUST** use strong password
- **Requirements:**
  - Minimum 16 characters
  - Mix of uppercase, lowercase, numbers, symbols
  - No dictionary words
  - Unique (not reused)
- **Example strong password:** `Kp9$xL2#mQ7@wR5!nV8`
- **Tools:** Use password generator (e.g., `openssl rand -base64 24`)

#### `FRONTEND_URL`
- **Type:** String (URL)
- **Default:** `http://localhost:3000`
- **Description:** Allowed frontend origin for CORS
- **Security Impact:** ⚠️ **HIGH**
- **Production:** **MUST** be set to actual frontend URL
- **Requirements:**
  - Use HTTPS in production (e.g., `https://yourdomain.com`)
  - No trailing slash
  - Exact match required (CORS is strict)

## 🎨 Frontend Variables

### Location
`frontend/my-app/.env` (create from `frontend/my-app/.env.example`)

### Variables

#### `REACT_APP_API_URL`
- **Type:** String (URL)
- **Default:** `http://localhost:8000`
- **Description:** Backend API base URL
- **Security Impact:** Medium
- **Production:** Set to production backend URL
- **Requirements:**
  - Use HTTPS in production (e.g., `https://api.yourdomain.com`)
  - No trailing slash
  - Must match backend's allowed CORS origins
- **Note:** This value is embedded in the frontend build (public)

## 🛡️ Security Best Practices

### 1. Never Commit .env Files ✅

```bash
# .gitignore already includes:
.env
.env.*
!.env.example  # Only examples are committed
```

### 2. Use Strong Passwords

**Generate strong passwords:**
```bash
# Option 1: OpenSSL
openssl rand -base64 32

# Option 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online tools
# https://www.lastpass.com/features/password-generator
```

### 3. Separate Environments

Create separate .env files for each environment:
- `.env.development` - Local development
- `.env.staging` - Staging server
- `.env.production` - Production server

### 4. Environment-Specific Values

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `DB_PASSWORD` | Simple (local only) | **Strong (16+ chars)** |
| `FRONTEND_URL` | `http://localhost:3000` | `https://yourdomain.com` |
| `REACT_APP_API_URL` | `http://localhost:8000` | `https://api.yourdomain.com` |

### 5. Validate Required Variables

The application should validate that all required environment variables are present at startup:

```javascript
// backend/src/config/validateEnv.js (recommended)
const requiredEnvVars = [
  'PORT', 'NODE_ENV', 'DB_HOST', 'DB_PORT',
  'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'FRONTEND_URL'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});
```

## 🚀 Production Deployment

### Pre-Deployment Checklist

#### Backend
- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `DB_PASSWORD` (16+ characters)
- [ ] Change `DB_USER` from default
- [ ] Set `FRONTEND_URL` to production HTTPS URL
- [ ] Verify `PORT` is correct
- [ ] Test database connection

#### Frontend
- [ ] Set `REACT_APP_API_URL` to production backend HTTPS URL
- [ ] Verify CORS settings match on backend
- [ ] Test API connectivity

### Deployment Steps

1. **Create production .env files** (on the server, not in git)
   ```bash
   # On production server
   cp backend/.env.example backend/.env
   cp frontend/my-app/.env.example frontend/my-app/.env
   ```

2. **Edit with production values**
   ```bash
   nano backend/.env
   nano frontend/my-app/.env
   ```

3. **Verify permissions** (Unix/Linux)
   ```bash
   chmod 600 backend/.env
   chmod 600 frontend/my-app/.env
   ```

4. **Restart services**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

## 🐳 Docker Configuration

### Docker Compose Environment Variables

Environment variables can be passed via `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - PORT=${PORT}
      - NODE_ENV=${NODE_ENV}
      - DB_HOST=postgres
      # ...
    env_file:
      - ./backend/.env  # Preferred: load from .env file
```

### Docker Secrets (Production)

For sensitive data in Docker Swarm:

```yaml
secrets:
  db_password:
    external: true

services:
  backend:
    secrets:
      - db_password
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
```

## 🔍 Verification

### Test Environment Variables

**Backend:**
```bash
cd backend
node -e "require('dotenv').config(); console.log(process.env.NODE_ENV)"
```

**Frontend:**
```bash
cd frontend/my-app
npm run build
# Check build/static/js/*.js for REACT_APP_API_URL
```

### Security Audit

Run these checks before production deployment:

```bash
# Check for committed .env files
git log --all --full-history -- "**/.env"

# Verify .env is gitignored
git check-ignore backend/.env frontend/my-app/.env

# Check password strength (manual review)
cat backend/.env | grep DB_PASSWORD
```

## ⚠️ Common Security Mistakes

### ❌ DON'T

1. **Don't commit .env files to git**
   ```bash
   # WRONG - exposes secrets
   git add backend/.env
   ```

2. **Don't use weak passwords**
   ```env
   # WRONG - easily guessable
   DB_PASSWORD=password
   DB_PASSWORD=admin123
   ```

3. **Don't use development values in production**
   ```env
   # WRONG - in production
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Don't hardcode secrets in code**
   ```javascript
   // WRONG - secret in code
   const password = "mypassword123";

   // CORRECT - from environment
   const password = process.env.DB_PASSWORD;
   ```

### ✅ DO

1. **Use strong, unique passwords**
2. **Separate environments** (dev, staging, prod)
3. **Validate required variables at startup**
4. **Rotate secrets regularly**
5. **Use HTTPS in production**
6. **Restrict file permissions** (chmod 600)

## 📚 Additional Resources

- [The Twelve-Factor App - Config](https://12factor.net/config)
- [OWASP - Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [dotenv Documentation](https://www.npmjs.com/package/dotenv)
- [Docker Secrets](https://docs.docker.com/engine/swarm/secrets/)

---

**Last Updated:** 2025-12-18
**Security Level:** 🔒 Production-Ready

🤖 Generated with [Claude Code](https://claude.com/claude-code)

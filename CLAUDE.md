# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IPSSI_PATCH is a secured full-stack web application demonstrating security best practices. The project was refactored from a vulnerable application to implement proper security measures including SQL injection prevention, XSS protection, and secure architecture patterns.

## Development Commands

### Docker (Primary Development Method)

```bash
# Start all services (PostgreSQL, Backend, Frontend)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove all data (including database)
docker-compose down -v

# View logs
docker-compose logs -f

# Rebuild single service
docker-compose up --build backend
```

### Backend (Local Development)

```bash
cd backend

# Development with auto-reload
npm run dev

# Production mode
npm start

# Install dependencies
npm install
```

### Frontend (Local Development)

```bash
cd frontend/my-app

# Start development server (port 3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

### Three-Tier Architecture

1. **Frontend (React)** - Port 3000 (dev) / 80 (production via Nginx)
2. **Backend (Express)** - Port 8000
3. **Database (PostgreSQL)** - Port 5432

### Backend Layer Structure

The backend follows a **layered architecture** pattern:

```
Request Flow:
Routes → Validators → Controllers → Services → Models (ORM) → Database
```

**Key Layers:**

- **Routes** (`src/routes/`): Define HTTP endpoints and attach validators
- **Validators** (`src/middlewares/validators.js`): Validate input using express-validator
- **Controllers** (`src/controllers/`): Handle HTTP requests/responses, coordinate services
- **Services** (`src/services/`): Contain business logic, interact with models
- **Models** (`src/models/`): Sequelize ORM models (User, Comment)
- **Config** (`src/config/database.js`): Database connection and Sequelize setup

**Critical Pattern:** All database operations MUST go through Sequelize ORM models. Never write raw SQL queries to prevent SQL injection.

## Security Implementation

**🔒 Security Level: Production-Ready**

The application implements a **defense-in-depth** strategy with **10 layers of security**. For complete documentation, see [SECURITY.md](./SECURITY.md).

### 1. SQL Injection Prevention ✅

- **Implementation:** Sequelize ORM with parameterized queries
- **DO:** Use Sequelize ORM methods (`User.findByPk()`, `User.create()`, `Comment.findAll()`)
- **DON'T:** Construct SQL strings with user input or raw queries
- **Location:** All models in `src/models/`
- All database operations go through ORM - raw SQL is never used

### 2. Cross-Site Scripting (XSS) Protection ✅

- **Implementation:** `xss` npm package sanitization
- **Applied to:** All comment content before saving to database
- **Location:** `src/services/commentService.js` line 17-21
- **Configuration:** No HTML tags allowed, scripts/styles stripped
- **Test:** `<script>alert("XSS")</script>` → `[removed]alert("XSS")` ✅

### 3. Input Validation ✅

- **Implementation:** `express-validator` middleware
- **Location:** `src/middlewares/validators.js`
- **Applied to:** All user inputs (userId, commentId, comment content)
- **Validates:** Data types, ranges, lengths, formats
- Applied to routes before controllers execute
- **Validations:**
  - `userId`: Must be positive integer
  - `commentId`: Must be positive integer
  - `comment`: Required, non-empty, max 1000 characters

### 4. Rate Limiting ✅

- **Implementation:** `express-rate-limit` middleware
- **Location:** `src/middlewares/rateLimiter.js`
- **Limits:**
  - API-wide: 100 requests per 15 minutes
  - Write operations (POST/DELETE): 50 requests per 15 minutes
  - Populate endpoint: 10 requests per hour
- Prevents brute force and DoS attacks

### 5. Security Headers ✅

- **Implementation:** Helmet.js with strict configuration
- **Location:** `src/server.js` lines 16-45
- **Headers Applied:**
  - Content-Security-Policy (CSP): Prevents XSS, clickjacking
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME sniffing)
  - Strict-Transport-Security (HSTS): Enforces HTTPS
  - X-XSS-Protection: Browser XSS protection
  - Referrer-Policy: Controls referrer information

### 6. CORS Protection ✅

- **Implementation:** Strict origin validation
- **Location:** `src/server.js` lines 47-68
- **Configuration:**
  - Only configured frontend URLs allowed
  - Methods: GET, POST, PUT, DELETE, OPTIONS only
  - Credentials enabled for same-origin only
  - Custom origin validation function

### 7. DoS Protection ✅

- **Implementation:** Request body size limits
- **Location:** `src/server.js` lines 73-76
- **Limits:** 10KB max for JSON, text, and URL-encoded bodies
- Prevents memory exhaustion attacks

### 8. Secure Error Handling ✅

- **Implementation:** Environment-based error responses
- **Location:** `src/server.js` lines 109-123
- **Production:** Generic error messages only (no stack traces)
- **Development:** Full error details for debugging
- Prevents information disclosure

### 9. Environment Variables Protection ✅

- **Implementation:** dotenv + .gitignore
- **Files:** `.env` (ignored by git), `.env.example` (template)
- **Protected Variables:** Database credentials, API keys, CORS origins
- Backend requires `.env` file (see `.env.example`)
- Never commit `.env` files (already in .gitignore)
- Secrets never logged or sent to client

### 10. Secure Cookie Configuration ✅

- **Implementation:** cookie-parser with secure flags
- **Location:** `src/server.js` line 71
- **Flags:**
  - HttpOnly: Prevents JavaScript access
  - SameSite: CSRF protection
  - Secure: HTTPS only (production)

### Security Testing

Test XSS protection:
```bash
curl -X POST http://localhost:8000/comment \
  -H "Content-Type: text/plain" \
  -d '<script>alert("XSS")</script>Test'
# Result: Script tags removed ✅
```

Test input validation:
```bash
curl -X POST http://localhost:8000/user \
  -H "Content-Type: application/json" \
  -d '{"userId": "invalid"}'
# Result: "userId must be a positive integer" ✅
```

### Security Checklist

- ✅ SQL Injection Protection (Sequelize ORM)
- ✅ XSS Protection (xss sanitization)
- ✅ Input Validation (express-validator)
- ✅ Rate Limiting (per endpoint)
- ✅ Security Headers (Helmet)
- ✅ CORS Protection (strict origins)
- ✅ DoS Protection (body size limits)
- ✅ Secure Error Handling
- ✅ Environment Variables Protection
- ✅ Secure Cookies

**📄 Complete Documentation:** See [SECURITY.md](./SECURITY.md) for detailed security documentation, test examples, and OWASP references.

## Database Management

### Sequelize Sync Behavior

The application uses `sequelize.sync({ alter: true })` in `src/config/database.js`. This automatically:
- Creates tables if they don't exist
- Alters existing tables to match model definitions
- **Caution:** Can cause data loss in production; use migrations for production

### Model Relationships

Currently, `User` and `Comment` models are independent. When adding relationships:
1. Define associations in `src/models/index.js`
2. Update sync strategy if needed
3. Consider adding migrations for production

## API Endpoints

All endpoints are defined in `src/routes/index.js`:

**Users:**
- `GET /populate` - Generate 3 random users via randomuser.me API
- `GET /users` - List user IDs
- `POST /user` - Get user by ID (requires `{userId: number}` in JSON body)

**Comments:**
- `GET /comments` - List all comments
- `POST /comment` - Create comment (text/plain body)
- `GET /comments/:id` - Get single comment
- `DELETE /comments/:id` - Delete comment

**Utility:**
- `GET /health` - Health check endpoint

## Frontend Architecture

- Single-page React app using hooks (no class components)
- API URL configured via `REACT_APP_API_URL` environment variable
- Axios for HTTP requests with centralized error handling
- All API calls use the new secured endpoints (not the deprecated `/query` endpoint)

## Common Development Tasks

### Adding a New Model

1. Create model file in `src/models/ModelName.js`
2. Define schema using Sequelize DataTypes
3. Export model in `src/models/index.js`
4. Create corresponding service in `src/services/`
5. Create controller in `src/controllers/`
6. Add validators in `src/middlewares/validators.js`
7. Add routes in `src/routes/index.js`

### Database Reset (Development)

```bash
# Docker method
docker-compose down -v
docker-compose up

# Local method
# Drop database manually, then restart backend
```

### Changing Database Configuration

1. Update `backend/.env` for local development
2. Update `docker-compose.yml` environment section for Docker
3. Both must match for consistency

## Port Conflicts

If ports are already in use:

- **Backend (8000):** Change `PORT` in backend/.env
- **Frontend (3000):** Change in frontend/my-app package.json or use `PORT=3001 npm start`
- **PostgreSQL (5432):** Change port mapping in docker-compose.yml

## Dependencies

When adding new npm packages:

- **Backend:** Must rebuild Docker image (`docker-compose up --build backend`)
- **Frontend:** Must rebuild Docker image (`docker-compose up --build frontend`)
- Always update both `package.json` and `package-lock.json`

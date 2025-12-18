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

### SQL Injection Prevention

- **DO:** Use Sequelize ORM methods (`User.findByPk()`, `User.create()`)
- **DON'T:** Construct SQL strings with user input
- All user inputs are validated before reaching the database

### XSS Protection

- Comment content is sanitized using the `xss` library in `commentService.js`
- Validation occurs at the service layer, not controller

### Input Validation

- Validators are defined in `src/middlewares/validators.js`
- Applied to routes before controllers execute
- Uses `express-validator` for type checking and sanitization

### Environment Variables

- Backend requires `.env` file (see `.env.example`)
- Database credentials and CORS origins are environment-based
- Never commit `.env` files (already in .gitignore)

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

<div align="center">

# 🚀 GSoft Node.js Monorepo

[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9+-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](services/backend/LICENSE)

</div>

A production-ready Node.js monorepo for building RESTful APIs. Ships with JWT authentication, role-based access control, request validation, Swagger documentation, Sentry error tracking, Docker support, CI/CD with semantic-release, and a Next.js landing page.

---

## ⚡ Quick Start

The interactive setup script detects your OS, installs prerequisites, and bootstraps the dev environment:

```bash
bash setup.sh
# or
pnpm setup
```

It will prompt you to select a service (Backend / Frontend / Both), then handle Node.js, pnpm, Docker, and dependency installation automatically.

## 🛠️ Manual Setup

```bash
# 1. Install dependencies (pnpm only)
pnpm install

# 2. Set up environment variables
cp services/backend/.env.example services/backend/.env
cp services/frontend/.env.example services/frontend/.env

# 3. Start backend with Docker (MongoDB included)
docker compose -f services/backend/docker/docker-compose.yml \
               -f services/backend/docker/docker-compose.dev.yml up

# Or start without Docker (requires local MongoDB)
pnpm dev

# 4. Start frontend
pnpm dev:frontend
```

## 📋 Prerequisites

- Node.js >= 24
- pnpm >= 9
- Docker (for backend with MongoDB)

## 📁 Project Structure

```
.
├── setup.sh                    # Interactive setup script
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # pnpm workspace definition (services/*)
├── eslint.config.js            # Shared ESLint 9 flat config
├── prettier.config.js          # Shared Prettier config
├── commitlint.config.js        # Conventional commits config
├── .lintstagedrc.json          # Pre-commit lint-staged config
├── .releaserc.json             # semantic-release config
├── .codeclimate.yml            # Code Climate quality gates
├── .editorconfig               # Editor consistency
├── .npmrc                      # Enforces pnpm
├── .node-version               # Node.js 24
├── .nvmrc                      # NVM version
├── CONTRIBUTING.md             # Contribution guidelines
├── .husky/
│   ├── pre-commit              # Runs lint-staged
│   └── commit-msg              # Runs commitlint
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline (lint, test, coverage)
│   │   ├── release.yml         # semantic-release automation
│   │   ├── codeql.yml          # CodeQL security scanning
│   │   ├── commitlint.yml      # Commit message linting
│   │   ├── dependency-review.yml # Dependency vulnerability review
│   │   ├── labeler.yml         # Auto-label PRs
│   │   └── stale.yml           # Stale issue/PR cleanup
│   ├── CODEOWNERS              # Team-based code ownership
│   ├── dependabot.yml          # Automated dependency updates
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/         # Bug report & feature request templates
├── services/
│   ├── frontend/
│   │   ├── src/app/            # Next.js App Router (layout, page, styles)
│   │   ├── public/             # Static assets
│   │   ├── next.config.js      # Next.js config
│   │   ├── jsconfig.json       # Path alias (@/* → src/*)
│   │   └── .env.example        # Environment template
│   └── backend/
│       ├── src/
│       │   ├── config/         # Environment, logger, passport, sentry, roles, tokens
│       │   ├── middlewares/    # Auth, validation, error handling, rate limiter, correlationId
│       │   ├── modules/
│       │   │   ├── v1/         # API v1 (auth, user, email, docs)
│       │   │   └── v2/         # API v2
│       │   ├── utils/          # ApiError, catchAsync, pick, customValidation, plugins
│       │   ├── app.js          # Express app setup & middleware chain
│       │   └── index.js        # Entry point, MongoDB connection, signal handlers
│       ├── tests/
│       │   ├── fixtures/       # Test data factories
│       │   ├── integration/    # Supertest integration tests
│       │   ├── unit/           # Service & utility unit tests
│       │   └── utils/          # Test helpers (setupTestDB)
│       ├── docs/
│       │   └── swagger/        # Swagger definitions & components
│       ├── docker/
│       │   ├── Dockerfile                  # Multi-stage (node:24-alpine)
│       │   ├── docker-compose.yml          # Base (app + MongoDB)
│       │   ├── docker-compose.dev.yml      # Development overlay
│       │   ├── docker-compose.prod.yml     # Production overlay
│       │   └── docker-compose.test.yml     # Test overlay
│       ├── ecosystem.config.json           # PM2 production config
│       └── .env.example                    # Environment template
```

## 💻 Commands

### 📦 Root (monorepo)

```bash
pnpm install          # Install all dependencies
pnpm setup            # Run interactive setup script
pnpm dev              # Start backend dev server
pnpm dev:frontend     # Start frontend dev server
pnpm dev:all          # Start all services concurrently
pnpm test             # Run all tests across workspaces
pnpm test:ci          # Tests with coverage
pnpm lint             # ESLint check
pnpm lint:fix         # Fix ESLint errors
pnpm format           # Format with Prettier
pnpm format:check     # Check formatting
pnpm release          # semantic-release (CI only)
```

### 🌐 Frontend (`services/frontend`)

```bash
pnpm --filter @gsoft/frontend dev    # Dev server (http://localhost:3000)
pnpm --filter @gsoft/frontend build  # Production build
pnpm --filter @gsoft/frontend start  # Start production server
pnpm --filter @gsoft/frontend lint   # Next.js ESLint
```

### 🔧 Backend (`services/backend`)

```bash
pnpm --filter @gsoft/backend dev          # Dev server with hot reload (Nodemon)
pnpm --filter @gsoft/backend start        # Production server (PM2)
pnpm --filter @gsoft/backend test         # Run tests
pnpm --filter @gsoft/backend test:watch   # Watch mode
pnpm --filter @gsoft/backend test:ci      # Tests with coverage
```

### 🐳 Docker

```bash
# From services/backend/
pnpm docker:dev       # Development (hot reload + MongoDB)
pnpm docker:prod      # Production (PM2 + MongoDB)
pnpm docker:test      # Run tests in container
```

Docker Compose runs:

- **node-app** — `node:24-alpine`, exposes port 3000, mounts source for hot reload (dev)
- **mongodb** — `mongo:4.2.1-bionic`, exposes port 27017, persistent volume `dbdata`

## 🔐 Environment Variables

### ⚙️ Backend (`services/backend/.env`)

The app validates that `.env` and `.env.example` have matching keys on startup using Joi.

| Variable                                | Description                                       | Default |
| --------------------------------------- | ------------------------------------------------- | ------- |
| `NODE_ENV`                              | Environment (`development`, `production`, `test`) | —       |
| `PORT`                                  | Server port                                       | `3000`  |
| `MONGODB_URL`                           | MongoDB connection string                         | —       |
| `JWT_SECRET`                            | JWT signing secret                                | —       |
| `JWT_ACCESS_EXPIRATION_MINUTES`         | Access token TTL                                  | `30`    |
| `JWT_REFRESH_EXPIRATION_DAYS`           | Refresh token TTL                                 | `30`    |
| `JWT_RESET_PASSWORD_EXPIRATION_MINUTES` | Reset password token TTL                          | `10`    |
| `JWT_VERIFY_EMAIL_EXPIRATION_MINUTES`   | Email verification token TTL                      | `10`    |
| `SMTP_HOST`                             | SMTP server host                                  | —       |
| `SMTP_PORT`                             | SMTP server port                                  | `587`   |
| `SMTP_USERNAME`                         | SMTP username                                     | —       |
| `SMTP_PASSWORD`                         | SMTP password                                     | —       |
| `EMAIL_FROM`                            | Sender email address                              | —       |
| `SENTRY_DSN`                            | Sentry DSN for error tracking                     | —       |

### 🌐 Frontend (`services/frontend/.env`)

| Variable              | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

## 🌍 API Endpoints

### 🔑 Auth (`/v1/auth`)

| Method | Endpoint                           | Description                      | Auth |
| ------ | ---------------------------------- | -------------------------------- | ---- |
| POST   | `/v1/auth/register`                | Register a new user              | No   |
| POST   | `/v1/auth/login`                   | Login and receive tokens         | No   |
| POST   | `/v1/auth/logout`                  | Logout (blacklist refresh token) | No   |
| POST   | `/v1/auth/refresh-tokens`          | Refresh access token             | No   |
| POST   | `/v1/auth/forgot-password`         | Send reset password email        | No   |
| POST   | `/v1/auth/reset-password`          | Reset password with token        | No   |
| POST   | `/v1/auth/send-verification-email` | Send email verification          | Yes  |
| POST   | `/v1/auth/verify-email`            | Verify email with token          | No   |

### 👥 Users (`/v1/users`)

| Method | Endpoint            | Description            | Auth           |
| ------ | ------------------- | ---------------------- | -------------- |
| POST   | `/v1/users`         | Create user            | `manageUsers`  |
| GET    | `/v1/users`         | List users (paginated) | `getUsers`     |
| GET    | `/v1/users/:userId` | Get user               | Owner or admin |
| PATCH  | `/v1/users/:userId` | Update user            | Owner or admin |
| DELETE | `/v1/users/:userId` | Delete user            | Owner or admin |

### 📚 API Docs

Start the server and visit `http://localhost:3000/v1/docs` for interactive Swagger documentation. The JSON spec is available at `/v1/docs/spec`.

## 🏗️ Architecture

### 🧱 Layers

**Controller** → **Service** → **Model**

- **Controllers** handle HTTP request/response only, delegate to services
- **Services** contain business logic, interact with models
- **Models** define Mongoose schemas and data access

Each module follows the structure:

```
module/
  ├── {name}.model.js       # Mongoose schema & plugins
  ├── {name}.controller.js  # HTTP handlers (uses catchAsync)
  ├── {name}.service.js     # Business logic
  ├── {name}.routes.js      # Express router + Swagger JSDoc
  ├── {name}.validation.js  # Joi schemas
  └── index.js              # Exports all submodules
```

### 🔀 API Versioning

Routes are organized under `/v1` and `/v2`, allowing gradual deprecation of endpoints while maintaining backwards compatibility.

### ⚠️ Error Handling

Throw `ApiError` anywhere — the centralized error middleware catches it:

```javascript
const { ApiError } = require('../utils');
const httpStatus = require('http-status');

throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
```

Async handlers are wrapped with `catchAsync` to forward errors automatically.

- **Development:** returns full error details with stack trace
- **Production:** hides internal details, only logs 5xx errors
- **5xx errors** are reported to Sentry automatically

### 🔒 Authentication & Authorization

JWT-based via Passport.js with Bearer token in the `Authorization` header.

**Roles:**
| Role | Rights |
|------|--------|
| `user` | — (base role) |
| `admin` | `getUsers`, `manageUsers` |

```javascript
// Require authentication
router.get('/profile', auth(), controller.getProfile);

// Require specific permission
router.delete('/users/:id', auth('manageUsers'), controller.deleteUser);
```

**Token types:**

- `ACCESS` — short-lived access token (default: 30 min)
- `REFRESH` — long-lived refresh token (default: 30 days)
- `RESET_PASSWORD` — password reset (default: 10 min)
- `VERIFY_EMAIL` — email verification (default: 10 min)

Token reuse detection: tokens are blacklisted on refresh, and new tokens are generated.

### ✅ Validation

All request input is validated at the route level with Joi schemas via the `validate` middleware:

```javascript
router.post('/users', validate(userValidation.createUser), userController.createUser);
```

Custom validators:

- `objectId` — validates MongoDB ObjectId format
- `password` — minimum 8 characters, at least 1 letter and 1 number

### 🗄️ Database

MongoDB via Mongoose with two custom plugins:

- **toJSON** — removes `__v`, timestamps, private fields; replaces `_id` with `id`
- **paginate** — adds `.paginate(filter, { sortBy, limit, page })` to models

In test environment, the database name is automatically suffixed with `-test`.

### 📊 Logging & Monitoring

- **Winston** — structured logging with dev/prod formats
- **Morgan** — HTTP request logging (separate success/error streams)
- **Correlation ID** — per-request UUID via `AsyncLocalStorage`, included in logs and `x-correlation-id` response header for distributed tracing
- **Sentry** — production error tracking for 5xx errors

### 📧 Email

Nodemailer-based email service for:

- Password reset emails (time-limited token)
- Email verification emails (time-limited token)

Configure SMTP settings via environment variables.

### 🛡️ Security

| Feature               | Implementation                                        |
| --------------------- | ----------------------------------------------------- |
| Authentication        | JWT via Passport.js (Bearer tokens)                   |
| Authorization         | Role-based access control (RBAC)                      |
| Password hashing      | bcryptjs (8 salt rounds)                              |
| Security headers      | Helmet.js (HSTS, CSP, X-Frame-Options, etc.)          |
| Input sanitization    | XSS-clean, express-mongo-sanitize                     |
| Parameter pollution   | HPP (HTTP Parameter Pollution) protection             |
| Rate limiting         | 20 requests per 15 min on auth endpoints (production) |
| CORS                  | Enabled (configurable origins)                        |
| Secrets               | Environment variables (never hardcoded)               |
| Token reuse detection | Blacklist + rotation on refresh                       |

### 🔌 Mongoose Plugins

- **toJSON** — removes `__v`, timestamps, private fields; replaces `_id` with `id`
- **paginate** — adds `.paginate(filter, { sortBy, limit, page })` to models

### ⚙️ Process Management

PM2 in production (`ecosystem.config.json`):

- Single instance, auto-restart, timestamp logging
- Start with `pnpm start` or `pnpm docker:prod`

## 🖥️ Frontend

The frontend is a Next.js 15 app (React 19) using the App Router. It serves as a landing page with:

- GSoft branding and project description
- Feature overview cards (auth, validation, docs, testing, Docker, CI/CD)
- Tech stack tags
- Links to API docs (`/v1/docs`) and GitHub
- Dark minimal aesthetic with plain CSS (no framework)

## 🔄 CI/CD

### 🤖 GitHub Actions Workflows

| Workflow                | Trigger                         | Purpose                                                     |
| ----------------------- | ------------------------------- | ----------------------------------------------------------- |
| `ci.yml`                | Push to `main`/`develop`, PRs   | Lint, format check, test with coverage, Code Climate upload |
| `release.yml`           | Push to `main`, manual dispatch | semantic-release (version bump, changelog, GitHub release)  |
| `codeql.yml`            | Push/PR, weekly schedule        | CodeQL security analysis                                    |
| `commitlint.yml`        | PRs                             | Validates commit messages                                   |
| `dependency-review.yml` | PRs                             | Scans for vulnerable dependencies                           |
| `labeler.yml`           | PRs                             | Auto-labels PRs by path                                     |
| `stale.yml`             | Scheduled                       | Marks and closes stale issues/PRs                           |

### 🔄 CI Pipeline (`ci.yml`)

1. **Change detection** — only runs jobs for changed paths (backend, root)
2. **Lint root** — ESLint on root config files (if changed)
3. **Backend** — Node 24 + MongoDB 7 service container:
   - `pnpm install` → `pnpm lint` → `pnpm format:check` → `pnpm test:ci` → Code Climate coverage upload
4. **Concurrency** — cancels in-progress runs on the same branch

### 🏷️ semantic-release

Configured in `.releaserc.json`:

- Analyzes conventional commits to determine version bump
- Generates release notes and updates `CHANGELOG.md`
- Commits `CHANGELOG.md` and `package.json` back to the repo
- Creates a GitHub release

### 🤖 Dependabot

Automated weekly dependency updates (Mondays):

- Separate groups: root, backend (minor/patch), GitHub Actions
- PR limits: 10 (root/backend), 5 (actions)
- Commit prefix: `chore(deps):` or `chore(ci):`

## ✨ Code Quality

### 🔍 ESLint

ESLint 9 flat config with:

- `@eslint/js` recommended + Airbnb base (via FlatCompat)
- Plugins: `security`, `n` (node), `jest`, `prettier`
- `no-console: error`, strict equality, no unused vars
- Frontend (`services/frontend/`) is excluded — uses Next.js built-in ESLint

### 💅 Prettier

```
Single quotes, 125 print width, trailing commas, semicolons, 2-space indent, LF line endings
```

### 📊 Code Climate

Complexity thresholds:

- Argument count: 5, Complex logic: 5, Method complexity: 10
- Method lines: 30, Return statements: 4
- Plugins: ESLint 9, duplication detection

### 🪝 Git Hooks (Husky)

| Hook         | Action                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| `pre-commit` | Runs lint-staged (ESLint --fix + Prettier on staged `.js` files; Prettier on `.json`, `.md`, `.yml`) |
| `commit-msg` | Runs commitlint (validates conventional commit format)                                               |

### 👥 CODEOWNERS

```
*                                           @gsoft/engineering
/*.config.js, /.github/                     @gsoft/platform-team
/services/backend/                          @gsoft/backend-team
/services/backend/src/middlewares/auth.js   @gsoft/backend-team @gsoft/security-team
```

## 🧪 Testing

- **Framework:** Jest + Supertest
- **Structure:** `services/backend/tests/` — `fixtures/`, `integration/`, `unit/`, `utils/`
- **Database:** `setupTestDB` helper handles MongoDB setup/teardown per test suite
- **Data:** Faker for test data generation
- **Coverage:** `text`, `lcov`, `clover`, `html` reporters
- **Patterns:**
  - Test both success and error cases
  - Test authentication and authorization separately
  - Verify response status codes and body structure
  - No shared state between tests

```bash
pnpm test             # Run all tests
pnpm test:ci          # Tests with coverage (CI)
pnpm --filter @gsoft/backend test:watch  # Watch mode
```

## 🧰 Tech Stack

| Layer              | Technology                                                         |
| ------------------ | ------------------------------------------------------------------ |
| Runtime            | Node.js 24 (CommonJS)                                              |
| Package manager    | pnpm 9+ (workspaces)                                               |
| Backend framework  | Express.js                                                         |
| Frontend framework | Next.js 15 (React 19, App Router)                                  |
| Database           | MongoDB via Mongoose                                               |
| Authentication     | Passport.js (JWT)                                                  |
| Validation         | Joi                                                                |
| Documentation      | Swagger (swagger-jsdoc + swagger-ui-express)                       |
| Testing            | Jest + Supertest                                                   |
| Linting            | ESLint 9 (flat config) + Prettier                                  |
| Email              | Nodemailer                                                         |
| Logging            | Winston + Morgan                                                   |
| Error tracking     | Sentry                                                             |
| Process manager    | PM2 (production)                                                   |
| Security           | Helmet, CORS, HPP, XSS-clean, express-mongo-sanitize, rate-limiter |
| CI/CD              | GitHub Actions + semantic-release                                  |
| Code quality       | Code Climate                                                       |
| Containers         | Docker + Docker Compose                                            |

## 🤝 Contributing

- Use `pnpm` only (enforced via `preinstall` hook and `.npmrc`)
- Follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): message`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `wip`, `hotfix`
- Scopes: `backend`, `frontend`, `root`, `ci`, `deps`, `release`
- Subject: lowercase, 10–100 characters
- All new endpoints need: validation → service → controller → route → tests
- Pre-commit hooks run lint-staged (ESLint + Prettier) via Husky
- Commit messages are validated by commitlint
- See `CONTRIBUTING.md` for full guidelines

## 📄 License

[MIT](services/backend/LICENSE)

---

<div align="center">

Made with ❤️ by [GSoft](https://github.com/Global-Software-Consulting)

</div>

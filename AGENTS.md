# AGENTS.md

## Project Overview

GSoft Node.js monorepo — a production-grade Express.js REST API boilerplate, managed with pnpm workspaces. The main branch is **database-agnostic** (no DB configuration). Database support lives on separate branches (`db/mongodb`, `db/sequelize`).

## Tech Stack

- **Runtime**: Node.js 24 (CommonJS)
- **Package Manager**: pnpm 9+ with workspaces
- **Backend**: Express.js, Passport.js (JWT auth)
- **Database**: None on main — repository pattern with `BaseRepository` abstract interface. Adapters on branches: Mongoose (`db/mongodb`), Sequelize (`db/sequelize`)
- **Testing**: Jest, Supertest
- **Linting**: ESLint 9 (flat config), Prettier
- **CI/CD**: GitHub Actions, semantic-release
- **Integrations**: Inngest, Temporal, Restate (optional workflow engines)

## Repository Structure

```
/                             # Monorepo root (pnpm workspaces)
├── services/backend/         # Express.js REST API
│   ├── src/
│   │   ├── config/           # Environment (Joi-validated), logger, passport, roles, tokens, sentry
│   │   ├── integrations/     # Workflow engines (inngest, temporal, restate)
│   │   ├── middlewares/       # Auth, validation, rate limiting, error handling, correlationId
│   │   ├── modules/          # Vertical slices (feature modules)
│   │   │   ├── v1/           # API v1 (user, auth, email)
│   │   │   └── v2/           # API v2 (user, auth, email)
│   │   ├── repositories/     # Database-agnostic repository pattern
│   │   │   ├── BaseRepository.js  # Abstract interface
│   │   │   └── index.js      # Lazy adapter loader (reads DB_ADAPTER env)
│   │   ├── utils/            # ApiError, catchAsync, pick, password, customValidation
│   │   ├── app.js            # Express app setup
│   │   └── index.js          # Entry point (server start)
│   ├── tests/                # Shared test utilities and integration tests
│   │   ├── fixtures/         # Test data factories (user, token)
│   │   ├── integration/      # Integration tests (docs, etc.)
│   │   ├── unit/             # Unit tests (middlewares, etc.)
│   │   └── utils/            # setupTestDB helper
│   └── docker/               # Dockerfile, docker-compose (dev, prod, test)
├── services/frontend/        # Frontend service
├── docker/                   # Workflow engine compose files (temporal, restate, n8n, node-red)
├── .github/workflows/        # CI, CodeQL, release, stale, labeler, dependency review
├── setup.sh                  # Interactive setup script (nvm, node, pnpm, docker)
└── configs at root           # ESLint, Prettier, commitlint, semantic-release
```

## Module Structure (Vertical Slices)

Each feature module is self-contained under `src/modules/v{N}/{feature}/`:

```
modules/v1/user/
├── index.js                  # Module barrel export
├── user.controller.js        # Request handlers (thin — delegate to service)
├── user.service.js           # Business logic (uses repository)
├── user.routes.js            # Express routes
├── user.validation.js        # Joi schemas
└── user.test.js              # Co-located tests
```

## Database & Repository Pattern

Main branch has **no database** — just the abstract `BaseRepository` interface and lazy adapter loading. Services use repository functions (`getUserRepository()`, `getTokenRepository()`) that are only resolved when a DB adapter is configured.

- **`db/mongodb` branch**: Adds Mongoose models, `MongooseBaseRepository`, MongoDB config
- **`db/sequelize` branch**: Adds Sequelize models, `SequelizeBaseRepository`, SQL config

To add a new DB adapter: implement `BaseRepository` methods + export `{ createRepositories, connect, disconnect }`.

## Build Commands

```bash
pnpm install              # Install all workspace deps
pnpm dev                  # Start backend dev server (nodemon)
pnpm test                 # Run all tests across workspaces
pnpm test:ci              # Run tests with coverage (CI mode)
pnpm lint                 # Lint entire repo
pnpm format:check         # Check formatting
bash setup.sh             # Interactive setup (nvm, node, pnpm, docker)
```

## Key Patterns

- **Architecture**: Vertical slices — `modules/v{N}/{feature}/` with controller → service → repository
- **Error handling**: Throw `ApiError` — caught by `errorHandler` middleware
- **Async routes**: Always wrap with `catchAsync` utility
- **Validation**: Joi schemas in each module's `*.validation.js`, enforced via `validate` middleware
- **Auth**: JWT tokens via Passport.js, role-based (user, admin)
- **Config**: `dotenv` → Joi-validated config object (`src/config/config.js`)
- **Repository**: Services call `getUserRepository()` / `getTokenRepository()` — lazy-loaded, DB-agnostic

## ECMAScript Best Practices

Use modern ECMAScript features (Node.js 24):

- Destructuring, spread/rest operators
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Array methods (`map`, `filter`, `find`, `some`, `every`) over manual loops
- Template literals for string interpolation
- `Promise.all()` / `Promise.allSettled()` for concurrent async
- `const` by default, `let` only when reassignment is needed
- Strict equality (`===`) only, early returns to avoid nesting
- Small, single-purpose functions

## Conventions

- CommonJS only (`require`/`module.exports`)
- Conventional commits: `type(scope): message`
- Scopes: `backend`, `root`, `ci`, `deps`, `release`
- Use `httpStatus` constants, never magic numbers
- Co-located tests in modules (`*.test.js`) + shared tests in `tests/`
- All endpoints need Joi validation

## Anti-Over-Engineering

- Write the simplest code that works. No premature abstractions.
- Don't create helpers/wrappers for one-time operations.
- Don't add error handling for impossible scenarios.
- Don't add config options or extensibility for hypothetical future use.
- Don't refactor surrounding code when fixing a bug or adding a feature.
- Only validate at system boundaries (user input, external APIs).
- Prefer plain functions and objects over complex design patterns.

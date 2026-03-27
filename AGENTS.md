# AGENTS.md

## Project Overview

GSoft Node.js monorepo — a production-grade Express.js REST API with MongoDB, managed with pnpm workspaces.

## Tech Stack

- **Runtime**: Node.js 24 (CommonJS)
- **Package Manager**: pnpm 9+ with workspaces
- **Backend**: Express.js, Mongoose, Passport.js (JWT)
- **Testing**: Jest, Supertest
- **Linting**: ESLint 9 (flat config), Prettier
- **CI/CD**: GitHub Actions, semantic-release

## Repository Structure

```
/                           # Monorepo root (pnpm workspaces)
├── services/backend/       # Express.js REST API
│   ├── src/
│   │   ├── config/         # Environment, logger, passport, roles, tokens
│   │   ├── controllers/    # Request handlers (thin — delegate to services)
│   │   ├── middlewares/     # Auth, validation, rate limiting, error handling
│   │   ├── models/         # Mongoose schemas and models
│   │   ├── routes/v1/      # Versioned API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # ApiError, catchAsync, pick
│   │   └── validations/    # Joi schemas
│   └── tests/              # Jest integration & unit tests
├── .github/workflows/      # CI, CodeQL, release, stale, labeler, dependency review
└── configs at root         # ESLint, Prettier, commitlint, semantic-release
```

## Build Commands

```bash
pnpm install              # Install all workspace deps
pnpm dev                  # Start backend dev server (nodemon)
pnpm test                 # Run all tests across workspaces
pnpm test:ci              # Run tests with coverage (CI mode)
pnpm lint                 # Lint entire repo
pnpm format:check         # Check formatting
```

## Key Patterns

- **Architecture**: Controller → Service → Model (layered)
- **Error handling**: Throw `ApiError` — caught by `errorHandler` middleware
- **Async routes**: Always wrap with `catchAsync` utility
- **Validation**: Joi schemas in `validations/`, enforced via `validate` middleware
- **Auth**: JWT tokens via Passport.js, role-based (user, admin)
- **Config**: `dotenv` → Joi-validated config object

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
- Tests go in `services/backend/tests/`
- All endpoints need Joi validation

## Anti-Over-Engineering

- Write the simplest code that works. No premature abstractions.
- Don't create helpers/wrappers for one-time operations.
- Don't add error handling for impossible scenarios.
- Don't add config options or extensibility for hypothetical future use.
- Don't refactor surrounding code when fixing a bug or adding a feature.
- Only validate at system boundaries (user input, external APIs).
- Prefer plain functions and objects over complex design patterns.

# CLAUDE.md — GSoft Node.js Monorepo

## Tech Stack

- Node.js 24 (CommonJS) with pnpm 9+ workspaces
- Express.js + Mongoose + Passport.js (JWT auth)
- Jest + Supertest for testing
- ESLint 9 (flat config) + Prettier
- GitHub Actions CI/CD + semantic-release

## Build Commands

```bash
pnpm install          # Install deps (only pnpm allowed)
pnpm dev              # Start backend dev server
pnpm test             # Run all tests
pnpm test:ci          # Tests with coverage
pnpm lint             # ESLint
pnpm format:check     # Prettier check
```

## Key Patterns

- Controller → Service → Model layered architecture
- Throw `ApiError` for errors, wrap async handlers with `catchAsync`
- Validate all input with Joi schemas via `validate` middleware
- JWT auth via Passport.js with role-based access (user, admin)
- Use `httpStatus` constants, not magic numbers

## ECMAScript Best Practices

Use modern ECMAScript features (Node.js 24): destructuring, spread/rest, optional chaining (`?.`), nullish coalescing (`??`), array methods over manual loops, template literals, `Promise.all()`, `const` by default, strict equality only, early returns.

## Conventions

- CommonJS only: `require`/`module.exports`
- Conventional commits: `type(scope): message`
- Scopes: `backend`, `root`, `ci`, `deps`, `release`
- 2-space indent, single quotes, semicolons, trailing commas

## Anti-Over-Engineering

- Simplest code that works. No premature abstractions.
- No helpers/wrappers for one-time operations.
- No error handling for impossible scenarios.
- No config options for hypothetical future use.
- Don't refactor surrounding code when fixing a bug.
- Only validate at system boundaries.

## Important Context

- Monorepo root has shared ESLint, Prettier, commitlint configs
- Backend service is at `services/backend/`
- All new endpoints need: validation → service → controller → route → tests

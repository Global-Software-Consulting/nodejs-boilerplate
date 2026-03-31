# 🤝 Contributing to GSoft

## 📋 Prerequisites

- Node.js 24+ (see `.nvmrc`)
- pnpm 9+ (`corepack enable && corepack prepare pnpm@latest --activate`)
- MongoDB 7+ running locally (or via Docker)

## 🛠️ Setup

```bash
git clone <repo-url>
cd nodejs-boilerplate
pnpm install
cp services/backend/.env.example services/backend/.env
# Edit .env with your local values
pnpm dev
```

## 🔄 Development Workflow

1. 🌿 Create a branch from `develop`: `git checkout -b feat/my-feature`
2. ✏️ Make changes following project conventions
3. ✅ Run checks before committing:
   ```bash
   pnpm lint
   pnpm format:check
   pnpm test
   ```
4. 💾 Commit using conventional commits: `feat(backend): add user avatar upload`
5. 🚀 Push and open a PR against `develop`

## 📝 Commit Convention

Format: `type(scope): message`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`, `hotfix`, `wip`

Scopes: `backend`, `root`, `ci`, `deps`, `release`

## 📁 Project Structure

- `services/backend/` — Express.js API service
- `packages/eslint-config/` — Shared ESLint configuration
- Root — Monorepo tooling (Husky, commitlint, Prettier)

## 💻 Code Conventions

- CommonJS (`require`/`module.exports`)
- 2-space indent, single quotes, semicolons, trailing commas
- Use barrel exports (`index.js`) for modules
- Follow controller -> service -> model architecture
- Validate input with Joi, wrap handlers with `catchAsync`

## 🧪 Testing

```bash
pnpm test                          # Run all tests
pnpm --filter @gsoft/backend test:watch  # Watch mode
```

- Integration tests use Supertest against the Express app
- Use `setupTestDB` helper for database lifecycle
- Test both success and error paths

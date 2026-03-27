# Codex Instructions

## Critical Rules

- This is a **CommonJS** project — use `require`/`module.exports`, never `import`/`export`
- Node.js 24 is required (see `.nvmrc`)
- pnpm is the only allowed package manager
- All commits must follow conventional commits: `type(scope): message`

## Style Guide

- 2-space indentation, single quotes, semicolons, trailing commas (ES5)
- Max line length: 125 characters
- Use `const` by default, `let` only when reassignment is needed

## Architecture

- **Controllers**: Handle HTTP request/response only — delegate logic to services
- **Services**: Business logic layer — interact with models
- **Models**: Mongoose schemas and data access
- **Validations**: Joi schemas for all request input

## ECMAScript Best Practices

Use modern ECMAScript features available in Node.js 24:

- Destructuring: `const { name, email } = req.body;`
- Spread/rest: `const merged = { ...defaults, ...overrides };`
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Array methods (`map`, `filter`, `find`, `reduce`) over manual loops
- Template literals for string interpolation
- `Promise.all()` for concurrent async operations
- `const` by default, `let` only when reassignment is needed
- Strict equality (`===`) only, early returns to avoid nesting

## Anti-Over-Engineering

- Write the simplest code that solves the problem
- No premature abstractions, helpers, or wrappers for one-time operations
- Don't add error handling for impossible scenarios
- Don't add config options for hypothetical future use
- Don't refactor surrounding code when fixing a bug
- Only validate at system boundaries (user input, external APIs)
- Prefer plain functions and objects over complex patterns

## Adding a New API Endpoint

1. Create Joi validation schema in `services/backend/src/validations/`
2. Create service methods in `services/backend/src/services/`
3. Create controller in `services/backend/src/controllers/`
4. Add route in `services/backend/src/routes/v1/`
5. Register route in `services/backend/src/routes/v1/index.js`
6. Add tests in `services/backend/tests/`

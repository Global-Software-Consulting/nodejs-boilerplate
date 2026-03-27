# Core Development Rules

## ECMAScript Best Practices

- Use destructuring: `const { name, email } = req.body;`
- Use spread/rest: `const merged = { ...defaults, ...overrides };`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Prefer array methods (`map`, `filter`, `find`, `some`, `every`) over manual loops
- Use template literals: `` `User ${id} not found` ``
- Use `Promise.all()` for concurrent async operations
- Use `const` by default, `let` only when reassignment is needed
- Strict equality (`===`) only — never loose equality
- Use early returns to avoid deep nesting
- Keep functions small and single-purpose

## Always

- Use CommonJS (`require`/`module.exports`)
- Follow controller → service → model architecture
- Validate all request input with Joi schemas
- Wrap async route handlers with `catchAsync`
- Use `httpStatus` constants for HTTP status codes
- Use `ApiError` for application errors
- Add tests for new functionality
- Use conventional commits with appropriate scope

## Never

- Use ES module syntax (`import`/`export`)
- Put business logic in controllers
- Use `var` declarations
- Hardcode configuration values (use env vars via `config/`)
- Skip input validation on endpoints
- Catch errors in controllers (let error middleware handle it)
- Use `npm` or `yarn` (pnpm only)
- Commit `.env` files

## Anti-Over-Engineering

- Write the simplest code that solves the problem
- No premature abstractions, helpers, or wrappers for one-time operations
- No error handling for impossible internal scenarios
- No feature flags or config options for hypothetical future use
- Three similar lines > one abstraction used three times
- Don't add comments for self-explanatory code
- Don't refactor surrounding code when fixing a bug or adding a feature
- Only validate at system boundaries (user input, external APIs)
- Prefer plain functions and objects over complex design patterns

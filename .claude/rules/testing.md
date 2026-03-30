# Testing Rules

## Structure

- Co-located tests in modules: `src/modules/v{N}/{feature}/*.test.js`
- Integration tests in `tests/integration/`
- Unit tests in `tests/unit/`
- Test fixtures in `tests/fixtures/` (user, token factories)
- Test utilities in `tests/utils/` (setupTestDB)
- Tests only run on DB branches (`db/mongodb`, `db/sequelize`) — main has no database

## Commands

```bash
pnpm test              # Run all tests
pnpm test:ci           # Run with coverage (CI)
pnpm --filter @gsoft/backend test:watch  # Watch mode
```

## Patterns

- Use `setupTestDB` helper for database setup/teardown
- Use factories (e.g., `faker`) for test data generation
- Test both success and error cases
- Test authentication and authorization separately
- Verify response status codes and body structure
- Clean up test data between tests (no shared state)
- Use repository pattern in tests — access data through `getUserRepository()` / `getTokenRepository()`

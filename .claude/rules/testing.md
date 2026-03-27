# Testing Rules

## Structure

- Tests live in `services/backend/tests/`
- Integration tests use Supertest against the Express app
- Unit tests for services and utilities

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

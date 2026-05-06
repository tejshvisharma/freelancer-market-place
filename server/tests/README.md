# Auth Tests

## Run Tests

```bash
cd server
npm test
```

## What These Tests Cover

- Registration flow
- Login flow
- Password reset flow
- 2FA flow
- Error scenarios (invalid login, invalid reset token)

## Notes

- Tests use an in-memory MongoDB instance via `mongodb-memory-server`.
- Email sending is mocked in tests to avoid SMTP calls.
- Required env vars are injected inside the test file for consistent runs.

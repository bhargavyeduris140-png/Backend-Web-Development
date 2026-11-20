# Authentication Fundamentals

A small Express and Prisma API that demonstrates secure registration and login with asynchronous bcryptjs password hashing.

## Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. The example environment file is safe to copy; keep your real `.env` and generated `prisma/dev.db` local and never commit them.

## Endpoints

### `POST /auth/register`

Request:

```json
{
  "name": "Sam",
  "email": "sam@example.com",
  "password": "correct horse battery staple"
}
```

- Requires non-empty string values for name, email, and password.
- Trims the name and normalizes email by trimming and lowercasing it.
- Hashes the password asynchronously with bcryptjs before persistence.
- Returns `201` with only `id`, `name`, and `email`.
- Returns `409` if the normalized email already exists.

### `POST /auth/login`

Request:

```json
{
  "email": "sam@example.com",
  "password": "correct horse battery staple"
}
```

- Requires non-empty string values for email and password.
- Looks up the normalized email and verifies the password asynchronously with bcryptjs.
- Returns `200` with only `id`, `name`, and `email` for valid credentials.
- Returns the same generic `401` response for an unknown email or an incorrect password.

Malformed or missing input returns `400`. Unexpected errors return a controlled `500` response. Passwords and password hashes are never included in API responses or application logs. No JWT or session is issued by this assignment.

## Project structure

- `src/routes/authRoutes.js`: HTTP route wiring.
- `src/services/authService.js`: validation and authentication workflow.
- `src/repositories/userRepository.js`: Prisma data access.
- `src/db/prisma.js`: Prisma client.
- `prisma/schema.prisma`: User model with unique email and password hash.

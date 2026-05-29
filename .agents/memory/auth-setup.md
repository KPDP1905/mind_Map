---
name: Auth setup
description: Custom session-based auth details
---

**Auth system**: Session-based (NOT Clerk). express-session + bcryptjs.

**Routes**: POST /api/auth/login, GET /api/auth/me, POST /api/auth/logout.

**Default credentials**: username: admin, password: MindMitra@123.

**Why bcryptjs**: Native `bcrypt` build script was blocked by pnpm onlyBuiltDependencies; replaced with `bcryptjs` (pure JS, identical API).

**DB**: Schema pushed via `pnpm --filter @workspace/db run push`. Admin user seeded directly via psql with bcryptjs hash.

**Session cookie**: named `mmid`.

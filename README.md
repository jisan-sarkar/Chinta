# Chinta

Chinta is a ChatGPT-like web AI workspace with a separate NestJS backend and a provider-agnostic AI layer.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn-style primitives
- NestJS, Prisma, PostgreSQL, Redis, BullMQ, SSE, Pino
- Better Auth, Cloudflare R2, Sentry-ready environment
- OpenRouter as the first live provider

## Local Setup

1. Copy `.env.example` into environment files for the web and API.
2. Start Postgres and Redis:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
pnpm install
```

4. Generate Prisma client and run migrations:

```bash
pnpm --filter @chinta/api prisma:generate
pnpm --filter @chinta/api prisma:migrate
```

5. Start both apps:

```bash
pnpm dev
```

The web app runs on `http://localhost:3000` and the API runs on `http://localhost:4000`.

## Development Notes

The API currently supports a development-only `x-user-id` header to unblock local feature work before production email delivery is configured for Better Auth. Do not ship production with the development guard behavior.

A modern social media platform built as a microservices-based monorepo powered by Turbo.

## What is included

- **Core microservice** — main domain logic (posts, comments, messages, likes, follows, and more).
- **Auth microservice** — user authentication and authorization.
- **Notifications consumer microservice** — asynchronous notifications processing.
- **Client app (Next.js)** — frontend web application.

## Technology stack

- **Node.js + TypeScript**
- **NestJS** (backend microservices)
- **Next.js** (frontend)
- **PostgreSQL**
- **RabbitMQ**
- **Turbo** (monorepo task runner)
- **Docker / Docker Compose**

## Repository structure

```txt
.
├── apps/
│   ├── core_microservice/                # NestJS core domain API
│   ├── auth_microservice/                # Authentication service
│   ├── notifications_consumer_microservice/  # Notifications consumer service
│   └── client_app/                       # Next.js frontend application
├── .github/workflows/                    # CI/CD pipelines
├── docker-compose.local.yml
├── docker-compose.prod.yml
└── turbo.json
```

## Quick start (local development)

### Requirements

- Node.js 18+
- npm 9+
- Docker + Docker Compose
- PostgreSQL 13+
- Redis 6+

### Install dependencies

```bash
npm install
```

### Start infrastructure services

```bash
npm run docker:up
```

### Configure environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Run database migrations

```bash
npm run db:migrate
```

### Start development servers

```bash
npm run dev
```

## Available scripts

```bash
npm run dev         # run development mode for all workspaces
npm run build       # build all workspaces
npm run test        # run tests
npm run lint        # run lint checks
npm run type-check  # run TypeScript checks
npm run docker:up   # start Docker Compose services
npm run docker:down # stop Docker Compose services
npm run db:migrate  # run DB migrations (core_microservice)
```

## Services

- **Core microservice** (port `3001`)
  - NestJS API gateway
  - Main business logic
  - Database operations
  - Real-time features

- **Authentication microservice** (port `3002`)
  - Express.js service
  - JWT token management
  - OAuth 2.0 integration
  - Session management

- **Notifications consumer** (port `3003`)
  - NestJS service
  - Message processing
  - Email notifications
  - Real-time notifications

- **Client application** (port `3000`)
  - Next.js frontend
  - React components
  - User interface
  - Real-time updates

- **PostgreSQL** (port `5433`)
- **RabbitMQ** (ports `5672` / `15672`) — AMQP / management UI

## Development workflow

1. Each feature should be focused and testable.
2. Follow microservices architecture patterns.
3. Implement features incrementally.
4. Write tests for each component.

## Contributing

1. Create a feature branch: `git checkout -b feature/INO-XXX`.
2. Implement your changes and run tests/linting (`npm run test`, `npm run lint`).
3. Commit with a clear message.
4. Open a Pull Request.

## License

This project is licensed under the **MIT License**. See `LICENSE` for details.

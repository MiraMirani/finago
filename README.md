# Finago

Simple full-stack hotel booking prototype.

## Tech

- Backend: Node.js + Express + Prisma + PostgreSQL
- Frontend: React + TypeScript + Vite + MUI

## Run with Docker (recommended)

```bash
docker compose up --build -d
```

- Web: http://localhost:5173
- API health: http://localhost:4001/api/v1/health

## Run locally

1. Install dependencies

```bash
npm install --prefix backend
npm install --prefix frontend
```

2. Create backend env

```bash
cp backend/.env.example backend/.env
```

3. Run migration and seed

```bash
npm run db:migrate
npm run db:seed
```

4. Start backend + frontend

```bash
npm run dev
```

- Web: http://localhost:5173
- API health: http://localhost:4000/api/v1/health

## Useful commands

- npm run dev
- npm run dev:backend
- npm run dev:frontend
- npm run build
- npm run lint
- npm run docker:up
- npm run docker:down

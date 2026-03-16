# Todo App

A local-first, real-time todo application built with Electric SQL and TanStack DB. Changes sync instantly across all connected clients via Electric's Postgres-to-client sync.

## Screenshot

![Todo App](screenshot.png)

## Features

- Add new todos with a title
- Toggle todos complete/incomplete with a checkbox
- Delete individual todos
- Filter todos: All / Active / Completed
- Live counters for active and completed todos
- Real-time sync — changes appear instantly across all open tabs/clients
- Optimistic mutations — UI updates immediately, no waiting for the server

## Getting Started

```bash
pnpm install
pnpm dev:start
```

The app will be available at http://localhost:5173.

## Tech Stack

- **Electric SQL** — Postgres-to-client real-time sync
- **TanStack DB** — Reactive collections and optimistic mutations
- **Drizzle ORM** — Type-safe Postgres schema and migrations
- **TanStack Start** — Full-stack React meta-framework with SSR
- **Radix UI Themes** — Accessible, themeable component library
- **Biome** — Fast linting and formatting

## Project Structure

```
src/
  db/
    schema.ts          # Drizzle table definitions
    zod-schemas.ts     # Zod schemas derived from Drizzle
    collections/
      todos.ts         # TanStack DB collection with Electric sync
  routes/
    index.tsx          # Main todo page UI
    api/
      todos.ts         # Electric shape proxy route
      mutations/
        todos.ts       # POST handler (create)
        todos.$id.ts   # PATCH/DELETE handlers (update/delete)
```

# Problem 5 — A CRUD Server

A backend server built with **Express + TypeScript**, backed by **SQLite** for
persistence. It exposes a CRUD API over a `resources` collection, with basic
list filtering, request validation and centralised error handling.

## Tech stack

- **Express 4** — HTTP server & routing
- **TypeScript** — required by the task
- **better-sqlite3** — simple, file-based SQL database (zero external services)
- **Zod** — request body / query validation
- **tsx** — run TypeScript directly in development

## Project structure

```
src/
├── index.ts                     # entry point — starts the server
├── app.ts                       # Express app factory (middleware + routes)
├── config.ts                    # env config (PORT, DB_PATH)
├── db.ts                        # SQLite connection (schema lives in migrations)
├── migrate.ts                   # migration runner (+ CLI entry)
├── migrations/
│   ├── types.ts                 # Migration type
│   ├── index.ts                 # ordered list of migrations
│   └── 001_create_resources.ts  # initial schema
├── errors.ts                    # HttpError helper
├── types.ts                     # Resource type
├── middleware/
│   ├── validate.ts              # Zod validation middleware
│   └── error.ts                 # 404 + central error handler
└── resources/
    ├── resource.schema.ts       # Zod schemas (create / update / list query)
    ├── resource.repository.ts   # DB access (prepared statements)
    ├── resource.controller.ts   # request handlers
    └── resource.routes.ts       # route wiring
```

## Configuration

Copy the example env file and adjust if needed (defaults work out of the box):

```bash
cp .env.example .env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port the HTTP server listens on |
| `DB_PATH` | `./data/resources.db` | SQLite file (created automatically) |

## Run

```bash
npm install          # install dependencies

npm run dev          # development (auto-reload) → http://localhost:3000
# or
npm run build        # compile TypeScript to dist/
npm start            # run the compiled server
```

From the repo root you can also use:
`npm run problem5:install`, `npm run problem5:dev`, `npm run problem5:build`,
`npm run problem5:start`.

## Database migrations

The schema is managed by migrations rather than created inline, so the database
can evolve safely over time.

- Each migration is a small module under `src/migrations/` (e.g.
  `001_create_resources.ts`), registered in order in `src/migrations/index.ts`.
- `src/migrate.ts` applies any **pending** migrations and records them in a
  `_migrations` table, so it's safe to run repeatedly (already-applied ones are
  skipped). All pending migrations run in a single transaction.
- Migrations run **automatically on server startup**, and can also be run
  manually:

  ```bash
  npm run migrate          # dev (tsx)
  npm run migrate:prod     # after `npm run build` (node dist/)
  ```

To add a new change, create `0xx_describe_change.ts` exporting a `Migration`
and append it to the list in `index.ts` — never edit an already-applied
migration.

## API

Base URL: `http://localhost:3000`

A **resource** looks like:

```jsonc
{
  "id": "uuid",
  "name": "Laptop",
  "category": "electronics",
  "description": "16-inch",
  "amount": 5,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/resources` | Create a resource |
| `GET` | `/resources` | List resources (with filters) |
| `GET` | `/resources/:id` | Get one resource |
| `PUT` | `/resources/:id` | Update a resource |
| `DELETE` | `/resources/:id` | Delete a resource |

### Create — `POST /resources`

Body (`name` and `category` required; `description`, `amount` optional):

```bash
curl -X POST http://localhost:3000/resources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Laptop","category":"electronics","description":"16-inch","amount":5}'
```

→ `201 Created` with the created resource.

### List — `GET /resources`

Supported query filters:

| Param | Type | Description |
| --- | --- | --- |
| `q` | string | Search in `name` / `description` |
| `category` | string | Exact category match |
| `minAmount` | number | `amount >= minAmount` |
| `maxAmount` | number | `amount <= maxAmount` |
| `sort` | `name` \| `amount` \| `createdAt` \| `updatedAt` | Sort field (default `createdAt`) |
| `order` | `asc` \| `desc` | Sort order (default `desc`) |
| `limit` | number 1–100 | Page size (default `20`) |
| `offset` | number ≥ 0 | Page offset (default `0`) |

```bash
curl "http://localhost:3000/resources?category=electronics&minAmount=1&sort=name&order=asc"
```

→ `200 OK`

```jsonc
{
  "data": [ /* resources */ ],
  "pagination": { "total": 1, "limit": 20, "offset": 0 }
}
```

### Get one — `GET /resources/:id`

```bash
curl http://localhost:3000/resources/<id>
```

→ `200 OK` with the resource, or `404 Not Found`.

### Update — `PUT /resources/:id`

Send any subset of fields (at least one):

```bash
curl -X PUT http://localhost:3000/resources/<id> \
  -H 'Content-Type: application/json' \
  -d '{"amount":99}'
```

→ `200 OK` with the updated resource, or `404 Not Found`.

### Delete — `DELETE /resources/:id`

```bash
curl -X DELETE http://localhost:3000/resources/<id>
```

→ `204 No Content`, or `404 Not Found`.

## Errors

- **400** — validation failed (returns the offending fields):

  ```json
  { "error": "Validation failed", "details": [ { "path": "name", "message": "Required" } ] }
  ```

- **404** — resource / route not found.
- **500** — unexpected server error.

## Notes

- Data persists in the SQLite file at `DB_PATH`; stop/restart the server and the
  data is still there.
- SQL is executed via prepared statements with bound parameters; sort columns
  come from a fixed whitelist — no string interpolation of user input.

# CampusOS — frontend / backend contract

The frontend is API-ready today. No component fetches, and no component holds
business logic: pages render view models that the service layer derives.

```
 Components  →  src/services/*  →  src/services/http.ts  →  Backend  →  PostgreSQL / Supabase
  (render)       (derive)            (one client)                        AI / external services
```

## The seam

Every read and write goes through `src/services/http.ts`:

| Function        | Use                                            |
| --------------- | ---------------------------------------------- |
| `request`       | reads with a synchronous demo fallback         |
| `requestAsync`  | reads whose fallback must itself fetch/compose  |
| `mutate`        | writes with an optimistic demo result           |
| `mutateAsync`   | writes whose fallback is asynchronous           |

Each one calls the API and falls back to demo data on **any** failure — no
backend, no network, a 500, a timeout. That is why the demo cannot break, and
it is also the mock↔real switch: there is nothing to rewrite. The moment
`VITE_API_URL` points at a running backend, live data flows and the fallbacks
stop being reached.

`getBackendState()` / `subscribeBackendState()` expose whether the API answered.
`DemoModeBanner` reads it and tells the student, once, that figures are
illustrative. **The product never presents demo data as an official record.**

## Endpoints the frontend already calls

| Method | Path                     | Service                          |
| ------ | ------------------------ | -------------------------------- |
| GET    | `/me`                    | `academics.getStudent`           |
| GET    | `/courses`               | `academics.listCourses`          |
| GET    | `/attendance`            | `academics.getAttendance`        |
| GET    | `/timetable`             | `academics.listSessions`         |
| GET    | `/results`               | `academics.getResults`           |
| GET    | `/deadlines`             | `signals.listDeadlines`          |
| GET    | `/announcements`         | `signals.listAnnouncements`      |
| GET    | `/events`, `/events/:id` | `campus.listEvents`, `getEvent`  |
| GET    | `/notifications`         | `campus.listNotifications`       |
| GET    | `/complaints`            | `complaints.listComplaints`      |
| GET    | `/complaints/:id`        | `complaints.getComplaint`        |
| POST   | `/complaints`            | `complaints.createComplaint`     |
| POST   | `/complaints/classify`   | `complaints.classifyPhoto`       |
| GET    | `/examinations`          | `examinations.getExams`          |
| GET    | `/fees`                  | `finance.getFees`                |
| GET    | `/edu-revolution`        | `campusLife.getEduProgress`      |
| GET    | `/today`                 | `today.getToday`                 |
| POST   | `/ai/chat`               | `ai.chat`                        |

Paths are relative to `VITE_API_URL` (default `/api`). Response shapes are the
types in `src/types/index.ts` — that file is the schema.

`/examinations` returns the schedule **and** whatever seat allocations have
been published — a seat is meaningless without its paper, so if the backend
sources them from two systems, joining them belongs on that side of the seam.
A missing `seat` is a real state the UI renders ("not released yet"), not an
error.

Not yet wired, because they have no screen behind them: `/appointments`,
`/teacher-on-leave`, `/practical-feedback`. Re-evaluation windows and seating
release dates are currently *derived* on the client from publication and exam
dates (`lib/results.revaluationWindow`, `lib/exams`) rather than fetched; each
becomes an endpoint once a real one exists.

### `GET /today`

The dashboard's whole view model in one response (`TodayView` in
`src/services/today.ts`): the summary line, the merged agenda, now/next,
signals, smart actions, insights, pulse, attendance and open requests.

Until the endpoint exists, `composeToday()` derives it on the client from the
five datasets the endpoint would read. Same function, same shape — when the
backend ships `/today`, `useToday` becomes a single query over `getToday()` and
**no component changes**.

## The AI layer

`src/services/ai.ts` is the only module the chat UI imports. The provider can be
swapped — hosted LLM, self-hosted, or the local rule engine — without touching a
component.

```
Student → Chat UI → services/ai.chat() → POST /ai/chat
                                          → intent detection
                                          → context retrieval (campus database)
                                          → LLM
                                          → validated response → Chat UI
```

**The model is never the source of truth for university data.** Retrieval runs
server-side against the campus database first; the model receives those records
as context and writes prose around them. For attendance, timetable, fees,
results, examinations, complaints and EDU-Revolution the figures must come from
the database, never the model.

The client enforces this at the boundary. `ai.validate()` rejects a response —
falling back to the local engine — when it:

- has no `content`,
- **cites no sources**, so a student could not see which records produced a
  figure. An uninspectable number is not displayed.

It also sanitises what it accepts: unknown source kinds are rejected, any source
not explicitly marked `live` is labelled `demo`, and actions are clamped to
in-app routes so a hallucinating or compromised model cannot turn an answer into
a link off the product.

### `POST /ai/chat`

```jsonc
// request
{ "question": "Can I skip tomorrow's DBMS?",
  "history": [{ "role": "user", "content": "..." }] }

// response — sources is REQUIRED
{ "content": "I wouldn't recommend it...",
  "data":    [{ "label": "Current", "value": "72%", "tone": "danger" }],
  "sources": [{ "kind": "attendance", "label": "Your attendance record",
                "detail": "18 of 25 DBMS classes attended", "source": "live" }],
  "actions": [{ "label": "View attendance", "to": "/app/attendance" }] }
```

The fallback, `services/assistant.ts`, is a local rule engine: it detects the
same intents, retrieves from the campus services, and **computes every figure**
from the student's records. It cannot invent one. The 75% attendance threshold
is labelled a demo figure, not an institutional policy.

## Secrets

The frontend reads exactly one environment variable, `VITE_API_URL`. Anything
prefixed `VITE_` is compiled into the bundle and is public.

**No API key, model credential or database secret belongs in this repository.**
The backend holds them and is the only thing that talks to an LLM provider.

## UI states

`@tanstack/react-query` drives per-query state; components render:

- **loading** — `ui/Skeleton`, shaped like the content it replaces
- **error** — `ui/States.ErrorState`, with a retry that refetches
- **empty** — `ui/States.EmptyState`, with the action that resolves it
- **offline / unavailable** — `layout/DemoModeBanner`, plus `ui/DemoTag` on any
  figure sourced from demo data

## Adding a domain

1. Type the response in `src/types/index.ts`.
2. Add the demo dataset to `src/data/` and export it from `src/data/index.ts`.
3. Add a service in `src/services/` calling `request('/path', () => demo)`.
4. Add a hook and cache key in `src/services/queries.ts`.
5. Render it. Derivation belongs in the service or `src/lib/`, never the page.

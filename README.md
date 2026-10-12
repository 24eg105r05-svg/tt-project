# CEMS 2.0: College Event Management System (React + Spring Boot)

Full-stack version of the CEMS prototype. The React UI is unchanged in look and feel, but all data now
lives in a real database behind a secured REST API instead of `localStorage`.

```
cems-fullstack/
├── backend/                     Spring Boot 3.3 · Java 17 · JPA · Spring Security (JWT)
│   ├── pom.xml
│   └── src/main/java/com/cems/
│       ├── config/              SecurityConfig, OpenApiConfig, DataSeeder
│       ├── controller/          Auth, Event, Registration (+check-in), Venue, Insights (analytics/audit)
│       ├── dto/                 Request/response records (validated with Jakarta Validation)
│       ├── exception/           ApiException + GlobalExceptionHandler (uniform JSON errors)
│       ├── model/               AppUser, Venue, Event, Registration, AuditLog (+ enums)
│       ├── repository/          Spring Data JPA repositories
│       ├── security/            JwtService, JwtAuthFilter
│       ├── service/             Business rules (Event, Registration, Analytics, Audit, Auth, Venue)
│       └── util/                TimeRange (clash detection), QrTokens, Ids
├── frontend/                    React 18 · Vite
│   └── src/
│       ├── api/client.js        fetch wrapper + JWT handling
│       ├── context/CemsContext  state, now backed by the API (same hook the components already use)
│       └── components/          Student / Organizer / Admin portals, Analytics, QR scanner, Login
└── docker-compose.yml           MySQL + backend + nginx-served frontend
```

## Run it locally (no Docker, no database to install)

Requirements: JDK 17+, Maven 3.9+, Node 18+.

```bash
# terminal 1: API on http://localhost:8080  (uses a local H2 file DB, seeds demo data)
cd backend
mvn spring-boot:run

# terminal 2: UI on http://localhost:3000  (Vite proxies /api to :8080)
cd frontend
npm install
npm run dev
```

Swagger UI: http://localhost:8080/swagger-ui.html  (click **Authorize** and paste a token from `/api/auth/login`).

### Demo accounts (password `cems@123`)

| Role      | Email                      |
|-----------|----------------------------|
| Student   | alex.rivera@college.edu    |
| Organizer | s.connor@college.edu       |
| Admin     | m.vance@college.edu        |

The login page also has **Demo quick login** buttons, and the header keeps the role switcher
(it performs a real login as the seeded account). New students can self-register.

## Run with Docker (MySQL)

```bash
export CEMS_JWT_SECRET="$(openssl rand -hex 32)"   # required for anything beyond a demo
docker compose up --build
# UI  http://localhost:3000     API  http://localhost:8080
```
For a real deployment set `CEMS_SEED=false` and `VITE_DEMO_MODE=false` (hides demo logins).

## What the backend enforces

| Feature | Rule |
|---|---|
| **Roles** | `STUDENT`, `ORGANIZER`, `ADMIN`, checked server-side with `@PreAuthorize`; the UI is not trusted. |
| **Smart scheduling** | Same venue + same day + **overlapping time slot** is rejected (409). Back-to-back slots are fine. Unparseable slots are treated as clashes. |
| **Capacity** | Event capacity can't exceed the venue's capacity. |
| **Approval workflow** | Organizer proposals start `PENDING`; admin approves/rejects once. Admin-created events publish directly. |
| **Registration** | Approved, upcoming events only; one registration per student (DB unique constraint). Event row is locked while seats are counted, so no overbooking. |
| **Waitlist** | Full event → `WAITLIST`. Cancelling a confirmed seat automatically promotes the oldest waitlisted student. |
| **QR check-in** | Unguessable single-use tokens (`SecureRandom`). Waitlisted, unknown, duplicate and other-organizer scans are denied; optimistic locking stops simultaneous double scans. |
| **Visibility** | Students see published events and their own tickets; organizers see their own events' attendees; admins see all and the audit log. |
| **Audit log** | Proposals, decisions, registrations, cancellations, promotions, check-ins, venue changes. |

## REST API

| Method & path | Who | Purpose |
|---|---|---|
| `POST /api/auth/login` · `POST /api/auth/register` · `GET /api/auth/me` | public / public / any | JWT login, student sign-up, current user |
| `GET /api/events` · `GET /api/events/{id}` | any | Role-filtered events with live `registeredCount`, `waitlistCount`, `seatsLeft` |
| `POST /api/events` | organizer, admin | Propose an event |
| `GET /api/events/conflicts?venueId&date&time` | organizer, admin | Live clash preview |
| `POST /api/events/{id}/approve` · `/reject` | admin | Decide a pending event |
| `POST /api/events/{id}/register` | student | Get a seat or waitlist spot + QR token |
| `GET /api/registrations` · `DELETE /api/registrations/{id}` | role-scoped / student, admin | List / cancel |
| `POST /api/checkin` | organizer, admin | Verify a scanned QR token |
| `GET /api/venues` · `POST /api/venues` | any / admin | Venues |
| `GET /api/analytics` · `GET /api/audit-logs` | any / admin | Dashboard aggregates · audit trail |

Errors are always JSON: `{ "timestamp", "status", "error", "message", "fieldErrors" }`.

## Configuration (environment variables)

| Variable | Default | Notes |
|---|---|---|
| `CEMS_DB_URL` / `CEMS_DB_USER` / `CEMS_DB_PASSWORD` | file H2 `./data/cems` | Point at MySQL for production |
| `CEMS_JWT_SECRET` | dev-only value | **Change it**; at least 32 bytes |
| `CEMS_JWT_EXPIRATION_MINUTES` | 480 | |
| `CEMS_CORS_ORIGINS` | `localhost:3000,5173` | Comma-separated |
| `CEMS_SEED` / `CEMS_DEMO_PASSWORD` | `true` / `cems@123` | Demo data on an empty DB only |
| `VITE_API_URL` (frontend) | `/api` | Absolute URL if API is on another origin |
| `VITE_DEMO_MODE` (frontend) | `true` | `false` hides demo logins |

## Tests

```bash
cd backend && mvn test
```
`TimeRangeTest` covers the clash logic. `CemsApiFlowTest` drives the whole API end-to-end with MockMvc:
role security, venue clash/capacity, approval, registration, waitlist promotion, QR single-use, analytics.

## Ideas for next steps
Email/SMS notifications on approval and waitlist promotion, event images upload, refresh tokens,
organizer-managed co-hosts, CSV export of attendance, Flyway migrations instead of `ddl-auto=update`.

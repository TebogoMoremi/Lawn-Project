# Database foundation

Milestone 3 adds PostgreSQL and Prisma 7.10.0 without connecting the public website to a database. Static content, pages and contact-preview behavior are unchanged. Node 24.13.1 is used for local verification and GitHub Actions. Prisma 8 was a release candidate when dependencies were selected, so the stable 7.10.0 packages are pinned together.

## Setup and environments

Use a separately provisioned PostgreSQL database for development. No OS software, Docker environment or production database was installed or configured by this milestone. Inspection found no local PostgreSQL service, `psql`/`pg_isready` command, conventional installation directory, listener on port 5432, local environment file or supplied `DATABASE_URL`.

From the project directory, create `.env` only if it does not already exist:

```powershell
Copy-Item .env.example .env
```

Replace `USER`, `PASSWORD`, host, port and database with your own **development** connection details. URL-encode special characters in credentials. The example is a placeholder, not a provisioned database. Prisma CLI and the seed explicitly load `.env`; Next.js loads its normal environment files. Avoid conflicting `DATABASE_URL` values in `.env` and `.env.local`; use `.env` as the common local source. Shell/CI environment values take precedence. `.env*` is ignored except the credential-free `.env.example`.

`DATABASE_URL` is server-only. No fallback connection is hardcoded. `ALLOW_DEVELOPMENT_SEED=true` explicitly opts a development or isolated test environment into seeding; it is false by default and seeding is rejected when `NODE_ENV=production`. This flag is an intent guard, not proof that a database is non-production: verify the target yourself. Never supply production credentials to development or tests.

Use separate database credentials and databases for development, integration tests and production. Ordinary tests and the current CI workflow need no database or secrets. PostgreSQL integration tests, when added, must require a dedicated disposable test database.

## Commands

```sh
npm ci                      # also generates Prisma Client; needs no database URL
npm run db:format
npm run db:validate
npm run db:generate
npm run db:migrate          # DEVELOPMENT ONLY; applies pending migrations
npm run db:status
npm run db:seed             # explicit development opt-in required
npm run db:studio           # local interactive data viewer
```

The root `prisma.config.ts` configures the schema, migration directory, seed command and environment-derived connection. The generated client lives in ignored `generated/prisma/`. Do not hand-edit or commit generated files. `npm ci` recreates them; if lifecycle scripts are intentionally disabled, run `npm run db:generate` before typechecking/building.

## Migration status and first database verification

**The initial migration is generated but unapplied and unverified against PostgreSQL.** It is checked-in-ready SQL, not evidence of a successful migration. It was produced without a connection using:

```sh
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/migrations/20261006000000_init_lawnflow_schema/migration.sql
```

PostgreSQL CHECK constraints were appended because Prisma's schema DSL does not express them. Do not regenerate over this migration and lose those checks. Future migrations should preserve them; review generated SQL and validate against an isolated database. Do not use `db push` as a substitute for applying migration history.

Once a development PostgreSQL database is available, set its URL and run:

```sh
npm run db:migrate
npm run db:status
npm run db:seed
npm run db:seed
```

The second seed should leave eight services and three areas without duplicates. This live idempotency check has **not** been run. `migrate dev` uses a shadow database, so its development role needs permission to create one, or a separately configured development-only shadow database. Never use a production database as a shadow database. Subsequent schema changes can use `npm run db:migrate -- --name describe_change`.

`npm run db:reset` deletes all data in the targeted development schema and reapplies migrations. It remains interactive and has no `--force` flag. Verify the URL and back up anything needed before running it. It was not run in this milestone. Prisma 7 requires explicit `npm run db:seed` after reset.

Future production deployment must use `npm run db:deploy` (`prisma migrate deploy`), never `migrate dev` or `migrate reset`. No deployment is configured here. Before release, exercise the migration on disposable PostgreSQL, test all constraints and delete behavior, then design production approval, backup and rollback procedures.

## Relational decisions

There are 16 domain models: Customer, Address, Service, ServiceArea, Quote, QuoteItem, QuotePhoto, QuoteStatusHistory, AvailabilitySlot, Booking, Notification, GalleryImage, Review, AIConversation, AIMessage and AuditLog. Prisma also manages a join table for area/service catalogue associations. Those associations do not imply confirmed coverage; areas are seeded inactive.

The 12 enums are QuoteStatus, PropertyType, LawnCondition, ServiceFrequency, AvailabilityStatus, BookingStatus, NotificationChannel, NotificationStatus, GalleryCategory, GalleryStage, AIMessageRole and AuditActorType.

- IDs are random UUIDs; human-facing quote/booking references are separate unique strings. Reference generation is deferred and must later use a transaction-safe sequence, not `count + 1`. A UUID or predictable reference never grants access by itself; future endpoints require authorization or separate scoped tokens.
- Customers may share an email/phone, so contacts are indexed rather than unique identity credentials. Email is optional and stored trimmed/lowercase; phone is optional and stored in international `+` format. A CHECK requires at least one contact. Future input validation must normalize values before writing. There is no authentication table.
- A customer has multiple addresses and quotes. The composite address/customer FK prevents a quote using another customer's address. Addresses used by a quote should be treated as immutable history: future address edits must create a new address record. Quote-item `serviceName` snapshots preserve agreed names independently of catalogue edits.
- A quote has at most one booking. Rescheduling updates that booking and should later write an audit event; recurrence/subscription scheduling is not modelled yet. Each separately priced visit can have its own quote. If a future accepted quote must cover many visits, introduce that change explicitly rather than silently reusing this constraint.
- Booking has a customer FK and a composite quote/customer FK. Its address is derived through Quote, avoiding another address ID that can disagree. Review has a unique booking and a composite booking/customer FK, preventing reviews assigned to a different customer. Prisma requires composite unique indexes to describe these one-to-one relations even though the single ID is also unique; other duplicate indexes were avoided.
- All business-history FKs use `Restrict` for deletes/updates. The implicit catalogue join can cascade-delete only its association rows, never quotes or bookings. Privacy deletion/anonymization must be a deliberate retention process, not a cascade through operational history.
- Currency amounts use `Decimal(12,2)` and remain nullable until known. Currency defaults to ZAR; quote items inherit the quote currency. Quantity is decimal and positive. SQL rejects negative/NaN amounts and inverted estimate ranges. This does not implement price calculation.
- All instants use PostgreSQL `timestamptz(3)`. Store instants consistently and present them in Africa/Johannesburg later. Slots have positive capacity and ordered times, plus a unique exact time window. Overlap between different slots and capacity across bookings are **not** prevented by these row checks. Future booking transactions must lock the slot row, check status/time containment and count capacity-consuming bookings before writing. Race tests and hold-expiry rules belong to availability implementation.
- Notifications include an idempotency key, attempt counters, schedule, lease timestamp/token and provider outcome fields. A future worker must atomically claim rows and handle expired leases; this is not an exactly-once provider guarantee. Optional customer/quote/booking links and AI customer/quote links must be checked for consistency and authorization by future writers. No worker/provider is active.
- Gallery stores asset metadata, dimensions, category and before/after grouping. Concepts default true and visibility defaults false. Quote photos store a private storage key and optional stable URL, not image bytes or expiring signed URLs. Future uploads must validate content, size, ownership and access; an `image/` MIME constraint alone is not upload security.
- Review ratings have a database CHECK from 1 to 5 and default to unapproved. No customer, review or testimonial data is seeded or displayed.
- Status history and audit logs are designed for append-only use by future services; the schema itself does not block updates/deletes by a privileged database role. Future workflows must update quote status and insert history in the same transaction, and deployment must assign appropriate restricted roles.

Indexes cover contact lookup, unique references/slugs, customer histories, status/time queues, slot bookings, notification leases, foreign keys and audit entity/actor timelines. CHECK constraints also cover coordinate pairs/ranges, positive file/image dimensions, valid schedule windows, booking status timestamps and non-empty content.

## Client and seed behavior

`lib/db.ts` is marked `server-only` and exposes lazy `getDb()`. It caches a client globally during hot reload and once per production process. It uses the PostgreSQL adapter with a bounded pool and a connection timeout. The connection parser forwards the chosen schema explicitly to the adapter and does not print URLs in validation errors. No presentation component imports it. Runtime database calls require the Node.js runtime; no Edge integration is provided.

The seed creates only the eight existing catalogue services and Benoni, Boksburg and Kempton Park. It uses their existing static content, slug upserts and a transaction. Fresh records remain inactive pending review. Reruns refresh managed content and area associations but preserve existing activation flags; they do not delete unrelated entries. No customers, bookings, availability promises, reviews, AI messages or notifications are created. Public pages continue to read static data regardless of database activation flags.

Database query logging is disabled. Seed errors deliberately omit raw driver messages. Exact addresses, message bodies, recipients, passwords, tokens and URLs with credentials must not be put into audit metadata or general logs. Define retention and redaction rules before collecting photos, notes or AI conversations.

## GitHub Actions

GitHub is the selected repository host and GitHub Actions the selected CI/CD platform. `.github/workflows/ci.yml` is validation only: checkout, Node setup, `npm ci`, Prisma validate/generate, lint, typecheck, unit tests and build. It has read-only repository permissions, does not persist checkout credentials and needs no database secrets. It has not run on GitHub until the user commits/pushes it.

Milestone 14 — GitHub Actions CI/CD will cover branch protections, isolated PostgreSQL integration tests, environment approvals, Docker images/registry, staging/production separation, safe migrations, health checks and rollback. The intended path is GitHub → GitHub Actions → Docker → AWS. No `.github/workflows/deploy.yml`, infrastructure or production secret is configured now.

Future environments may need `DATABASE_URL`, provider keys such as `OPENAI_API_KEY`, `WHATSAPP_ACCESS_TOKEN`, `EMAIL_API_KEY` and `SMS_API_KEY`, plus AWS region and authentication configuration. Prefer scoped GitHub-to-AWS OIDC roles when deployment is designed; long-lived AWS access keys are not configured here. Public/non-sensitive values can use GitHub environment variables; sensitive values must use GitHub Secrets. No fake production secret was created.

## Dependency audit limitation

The installation audit reported nine high-severity dependency findings: five in the existing Next.js ESLint chain and four through Prisma tooling (`deepmerge-ts`, `@prisma/config`, `mysql2`, `prisma`). `npm audit --omit=dev` still reports the four Prisma-chain findings because the client package's peer dependency brings the CLI tree into that audit view. The PostgreSQL app does not use the MySQL driver, but the installed dependency findings remain unresolved. npm suggests incompatible older major versions; no force downgrade or unverified transitive major override was applied. Reassess upstream fixes and deployment packaging before production release.

Version/configuration references: [Prisma 7 config](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference), [Prisma 7 client](https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/introduction), [GitHub checkout](https://github.com/actions/checkout), [GitHub Node setup](https://github.com/actions/setup-node).

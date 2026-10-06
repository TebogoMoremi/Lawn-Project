# LawnFlow

A lawn-care platform built incrementally. **Milestone 3: database foundation, with the Milestone 2 public website preserved.** The Milestone 1 branding, homepage hero, layout and tooling are retained. This preview does not send contact drafts, calculate prices or create bookings.

## Run locally

Requires Node.js 22.12+ or 24+ and npm; Node 24.13.1 is used by CI:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` then `npm start`. Use `npm run start -- --port 3100` if another preview already occupies port 3000.

## Public website

- `/`: hero, service preview, process, values, concept before/after, planned areas, FAQ and final CTA.
- `/services` and `/services/[slug]`: eight services, scope, benefits, FAQs and related services.
- `/areas` and `/areas/[slug]`: Benoni, Boksburg and Kempton Park, with distinct enquiry-planning guidance. Coverage is planned and must be confirmed for an address.
- `/gallery`: four categories with clearly labelled before/after concept illustrations, not customer projects.
- `/about`: the intended approach to care, communication and quotes.
- `/contact`: a client-validated draft preview; no network submission, message delivery or application storage.
- `/quote`: the existing coming-soon destination.

All service and area slugs are prerendered with data-driven metadata. Unknown slugs return 404. The preview retains `noindex, nofollow`; review this before a public launch.

## Structure

```text
app/                    Routes, metadata, root layout and styles
components/
  layout/               Shared responsive header and footer
  ui/                   Existing brand and button-link primitives
  public/               Hero/breadcrumbs, cards, FAQ, process and CTA
  contact-form.tsx      Client-side draft validation and accessible feedback
  whatsapp-link.tsx     Centralized config-aware enquiry link
features/home/          Homepage composition and shared process content
data/                   Typed services, areas, gallery and FAQ content
lib/                    Configuration, contact validation and unit tests
public/images/          Local SVG concept illustrations
scripts/verify-public.mjs Production HTTP route/link/image checks
```

Next.js App Router, React, strict TypeScript, Tailwind CSS v4, ESLint, Prettier and Vitest. Public content is server-rendered; navigation and the contact draft checker use client components. Data is separate from presentation so future storage can replace the static catalogues.

## Configuration

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_WHATSAPP_NUMBER` is optional: 8–15 international digits, no `+` or spaces. When missing, every WhatsApp CTA links to the explanatory notice on `/contact#whatsapp-status`. When configured, it opens an enquiry; no quote or booking is created. Service and area pages supply contextual messages through the shared component. Restart/rebuild after changing public environment variables. Never put secrets in `NEXT_PUBLIC_*` variables.

`DATABASE_URL` now configures PostgreSQL for Prisma tooling and future server-side data access. The public website still uses static content and needs no database. Copy `.env.example` to `.env` for database tooling and replace its placeholders with development credentials. `.env*` stays ignored except `.env.example`. See the database section below.

Add/remove services in `data/services.ts`, and update area service references in `data/areas.ts` as necessary. Add/remove areas in `data/areas.ts`; route generation and cards follow the catalogue. Gallery entries store image paths, alt text and dimensions separately from the card; future approved remote storage can use the same shape with an explicit Next.js image allowlist.

## Contact preview

The five required fields validate name, email, mobile, subject and message length. Errors are associated with each field, focus moves to the first error, and a live status region explains the result. Even a valid draft explicitly remains unsent. The form uses `method="dialog"` outside a dialog to suppress native network submission if JavaScript is unavailable, while JavaScript prevents submission and checks the draft. No form data is appended to the URL. Use sample details for preview testing.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

With the production preview running:

```sh
node scripts/verify-public.mjs http://localhost:3100
```

Unit tests cover catalogue lookup and invalid slugs, area service references, contact validation and WhatsApp configuration/message encoding. The HTTP smoke check follows internal links across all 18 public URLs, checks metadata/headings, anchors, nine image assets and unknown-route 404 responses.

Browser verification for Milestone 2 covered the major page templates at 375, 768, 1024 and 1920 CSS pixels; mobile navigation, Escape/focus restoration, close-on-navigation, current-page indication and invalid/valid contact drafts were also checked. No horizontal overflow or browser warning/error logs were observed in those checks.

## Content and accessibility

No fabricated reviews, statistics, certifications or customer projects. Service scope is proposed content awaiting business approval. Area pages describe planned coverage without promising availability or inventing neighbourhood-specific facts.

Semantic landmarks, one main heading per page, skip navigation, visible focus, labelled fields, native keyboard-accessible FAQ disclosures and reduced-motion support are retained or added. Mobile navigation closes on activation, Escape and focus leaving the header. System fonts and local SVGs avoid external asset dependencies.

## Deferred work and launch checks

Stop after Milestone 3 review. Database schema, client, migration SQL and development seed are prepared; no live database was available to apply or verify the migration/seed. Authentication, admin, quote workflows, scheduling, AI, providers, AWS, Docker and production deployment remain deferred. GitHub Actions is the selected CI/CD platform; only basic validation is configured now. Advanced SEO remains deferred.

Before launch: confirm service scope and actual area coverage, configure the real business WhatsApp number, replace concepts with approved photography when available, and review preview indexing directives. Add server validation and other protections when real message/quote endpoints are implemented.

The build may warn about an unrelated ancestor `package-lock.json`; Next.js ignores it. The Milestone 3 dependency audit reports unresolved advisories in the Next.js ESLint and Prisma tooling trees; see the database documentation for details before release.

## Database foundation and GitHub Actions

Prisma 7.10.0 uses `prisma.config.ts`, `prisma/schema.prisma`, a generated client in `generated/prisma/`, and the lazy server-only client in `lib/db.ts`. `npm ci` generates the client automatically without requiring a database connection.

```sh
npm run db:format
npm run db:validate
npm run db:generate
npm run db:migrate   # development only, after configuring local PostgreSQL
npm run db:status
npm run db:seed      # requires ALLOW_DEVELOPMENT_SEED=true; no production use
npm run db:studio
```

The initial SQL migration was generated offline and has **not** been applied. Migration execution and seed idempotency await a development PostgreSQL instance. `npm run db:reset` deletes development data and requires confirmation; never use it against production. Future deployment uses `npm run db:deploy`, never `migrate dev`.

The basic GitHub Actions workflow runs installation, Prisma checks, lint, typecheck, tests and build without database credentials. Full GitHub Actions CI/CD, Docker and AWS deployment belong to Milestone 14 and later infrastructure work.

See [database setup and design](docs/database.md) for environment separation, schema decisions, migration/seed instructions, reset warnings, audit findings and future GitHub Secrets. No production credentials or deployment workflow are included.

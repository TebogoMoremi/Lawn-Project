# LawnFlow

A lawn-care booking platform, built incrementally. **Milestone 1: foundation only.** This preview does not collect customer information, calculate prices or create bookings.

## Run locally

Requires Node.js 22+ and npm. From this directory:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open http://localhost:3000. For a production preview: `npm run build` then `npm start`.

## Foundation

Next.js App Router, React, strict TypeScript, Tailwind CSS v4, ESLint, Prettier and Vitest. Shared responsive navigation and footer, an illustrated homepage, service previews, process explanation, values, coverage notice and contact CTA. Most UI is server-rendered; only the mobile navigation needs a client component.

The existing root `app/` convention is retained to avoid unnecessarily moving the starter. Business logic will live outside route handlers as later milestones add it.

```text
app/                    Routes, root layout, styles, metadata, icon
  quote/                Honest coming-soon destination for quote CTAs
components/
  layout/               Shared header and footer
  ui/                   Brand and button-link primitives
  whatsapp-link.tsx     Config-aware enquiry link
features/home/          Homepage composition and structured preview content
lib/                    Environment configuration and tests
public/images/          Replaceable local illustration
```

## Configuration

Copy `.env.example` to `.env.local`. `NEXT_PUBLIC_WHATSAPP_NUMBER` is an optional public business phone number in international format (8–15 digits, no `+` or spaces). When absent, WhatsApp buttons link to the explicit unconfigured contact notice. When configured they open a simple enquiry; no quote or booking is created. Restart/rebuild after changing public environment variables. Never put secrets in `NEXT_PUBLIC_*` variables.

`DATABASE_URL` is reserved for milestone 3 and unused today. There is no database dependency, migration or seed yet. Keep `.env.local` and credentials out of Git; `.env.example` contains no secrets.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

Configuration tests cover absent/invalid numbers and correctly encoded contact URLs. Quote, authentication, booking and notification tests belong with those implementations. Playwright flow coverage will be added as working flows become available.

## Content and accessibility

Navigation uses existing homepage sections until public pages are implemented in milestone 2. `/quote` explicitly states that requests are not open. Coverage is unconfirmed; there are no fabricated reviews, prices or statistics. `public/images/garden-illustration.svg` is a labelled concept illustration, not a completed customer project. Replace it with licensed business photography and meaningful alt text later.

Includes semantic landmarks, a skip link, visible keyboard focus, mobile navigation with expanded state and Escape support, responsive layouts and reduced-motion preferences. System fonts keep the build independent of external font downloads. Preview metadata is `noindex, nofollow`; revisit at the SEO milestone before launch.

## Next milestones and deployment

Stop after foundation approval. Follow with public pages, PostgreSQL/Prisma schema and migrations, quote workflow, estimator, concurrency-safe availability, authenticated admin, notifications, WhatsApp handoff and AI abstractions. Estimates must always remain non-binding and human-reviewed.

There are no admin endpoints or sensitive-data forms in this milestone. Add server validation, authorization, secure tokens, upload validation, rate limits and retention policies alongside the relevant features. Do not treat this foundation as a production-ready booking service.

Docker is milestone 13; CI/CD is milestone 14; AWS architecture is milestone 15. No cloud infrastructure, production credentials or deployments are configured. Future providers must use environment-based secrets, durable notification jobs and replaceable service interfaces.

Dependency audit: the existing Next.js ESLint toolchain currently reports a braces denial-of-service advisory affecting development tooling, with no compatible upstream fix reported by npm. Production dependencies passed npm audit --omit=dev. Recheck before release; do not downgrade Next.js tooling with audit fix --force.

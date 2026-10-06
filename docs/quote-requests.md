# Customer quote requests

Milestone 4 adds Contact → Location → Services → Property → Photos → Notes → Review at `/quote`. `POST /api/quotes` validates and persists a complete request; `/quote/success` reads its private receipt. No incomplete drafts are stored. Public service pages retain their static editorial content; the form queries only active PostgreSQL services.

## Enable in development

1. Configure a separately provisioned development PostgreSQL database using the instructions in [database.md](database.md). No PostgreSQL connection or credentials are currently supplied in this workspace.
2. Run `npm run db:migrate`, `npm run db:generate` and `npm run db:status`. The original migration and additive quote migration must both be applied. Never run development migrations against production.
3. If needed, explicitly opt into the development seed with `ALLOW_DEVELOPMENT_SEED=true`, then run `npm run db:seed`. The seed deliberately leaves services inactive.
4. Intentionally enable the services being tested using `npm run db:studio` (Service.active), then restart the app. Do not represent planned coverage as confirmed. The quote form accepts other cities and leaves coverage review to LawnFlow.
5. Submit sample details and verify Customer, Address, Quote, QuoteItem, optional QuotePhoto and QuoteStatusHistory rows. Confirm `QUOTE_REQUESTED`, null pricing and a reference. Test identical retries, simultaneous requests, a disabled service and forced rollback on a disposable database.

These live persistence/concurrency/rollback checks have **not been performed**. Offline tests mock transaction methods and do not prove PostgreSQL integration. Missing database, failed catalogue reads or no active services show an honest unavailable page; no fallback or fake receipt is produced.

## Data and identity

Shared strict Zod schemas trim text, lowercase email, normalize local South African phones to +27 and accept reasonable international numbers. Postal codes require four South African digits. Notes are optional, capped at 2,000 characters. Service IDs must be unique UUIDs and currently active inside the transaction. The request schema rejects extra fields, including prices, statuses and customer IDs.

Anonymous contact details are not identity proof. Each distinct request creates a new customer and owned address, even when email/phone match. An identical retry reuses the entire existing quote. Verified identity/reconciliation belongs to a future authenticated workflow; the existing schema still supports multiple addresses and quotes per customer.

Lawn size is a separate category; the existing square-metre decimal remains null. UNKNOWN frequency maps to null. No prices are accepted or calculated. Consent is unchecked and required; acknowledgment time and `quote-request-v1` are saved. No marketing consent is inferred.

## Transactions, references and retries

An atomic PostgreSQL counter upsert allocates a number for the Africa/Johannesburg calendar year. References use `LF-2026-000001`; digits expand beyond six. The unique Quote.reference constraint is the last line of defense. Allocation is outside the transaction so rollback can leave harmless gaps. Unique collisions retry at most three times; when importing historical references, initialize the counter at or above the largest imported number for each year.

The browser generates a 256-bit random attempt token. Only this token is kept in sessionStorage; personal fields/photos stay in memory. PostgreSQL stores its SHA-256 hash and a digest of normalized request data plus sanitized photo contents. An advisory transaction lock serializes the same attempt across processes; the transaction rechecks for an existing quote before creating anything. Changed details against an already accepted token are rejected with 409. The form offers a clearly separate new request after directing the customer to check the existing confirmation. Identical retries return the original receipt without duplicate records, even if a prior response was lost. The loading state also blocks double clicks immediately.

Customer, address, quote, service snapshots, photo metadata and initial history are created within one transaction. A successful request is `QUOTE_REQUESTED`, never quoted/approved/booked. Receipt expiry is 24 hours from the original submission, not extended by retries.

Confirmation uses a same-site, HttpOnly cookie scoped to `/quote`, Secure over HTTPS. Only its matching non-expired hash can retrieve the minimal first name, reference and service names. Tokens, database IDs and contact/address fields are absent from URLs; pages are private/no-store with no-referrer. Only the latest receipt cookie in that browser is shown. Clearing cookies or expiry prevents access. Refreshing the unfinished form clears personal fields, but retains the attempt token where sessionStorage is supported. Keep failed submissions open; retry the same details. If storage is disabled, retry protection lasts for that mounted form only.

## Photos and storage

`StorageService` separates file operations from quote logic; `LocalStorageProvider` writes private files to `.local/quote-uploads` (ignored) or the configured `LOCAL_UPLOAD_DIR`. Keep custom storage outside `public/`, outside source control, and inaccessible to untrusted filesystem users. There is deliberately no public upload-serving route. Files are not database blobs.

Default limits are 5 photos and 5 MB each. `QUOTE_MAX_PHOTOS` accepts 1–8 and `QUOTE_MAX_PHOTO_MB` accepts 1–8; invalid configuration fails closed. Combined photos are limited to 31 MB, and the HTTP body to the lesser of configured capacity plus 64 KB and 32 MB. The server counts actual stream bytes rather than trusting Content-Length, rejects unsupported multipart fields, limits JSON to 16 KB and times out body reading at 30 seconds.

Both sides check count, nonzero size, MIME and extensions. Sharp independently decodes and validates actual JPEG/PNG/WebP content, rejects animated/mismatched/unreadable images and more than 20 megapixels, rotates, bounds dimensions to 2560 pixels, strips metadata and re-encodes WebP. UUID filenames use exclusive creation; customer filenames never determine paths. Storage keys are restricted and resolved within the root. Previews use temporary browser blob URLs and release them on removal/unmount.

Filesystem and database cannot commit atomically. Known transaction rejections remove staged files best-effort; upload failure rolls back database work. An ambiguous connection/commit failure retains files to avoid deleting a potentially committed photo. Cleanup failures log only event codes. Before production, add a private reconciliation/retention job that checks orphan keys against QuotePhoto after a safe age; never blindly delete recent files. Back up database and uploads together. Local disk is appropriate for a single persistent development instance, not ephemeral/multi-instance hosting. S3 is intentionally deferred.

## Abuse controls and operational limits

The endpoint requires same-origin Origin and uses a bounded process-local guard (30 attempts/minute, at most 3 concurrent submissions). It does not trust client-supplied forwarding/IP headers. This is a lightweight development guard, not a distributed or per-customer production limit. Before public launch, add a shared rate limiter and ingress body/time limits, verify proxy/canonical-origin handling and HTTPS, define retention/deletion/support policies, and test the actual PostgreSQL and storage deployment. No database error, SQL, path, environment value or stack is returned. Logs use non-personal event codes.

The optional WhatsApp handoff includes only the public reference and selected service names. It is absent when no number is configured. It sends nothing automatically. Availability, pricing, booking, payments, notifications, authentication, AI, external storage and deployment remain future work.

## Verification

Run `npm run db:validate`, `npm run db:generate`, `npm run lint`, `npm run typecheck`, `npm test` and `npm run build`. Existing GitHub Actions executes these without a database or secrets. `node scripts/verify-public.mjs http://localhost:3101` checks the public production preview. Form interaction tests use synthetic data and mocked fetch; photo tests decode real generated image bytes and exercise temporary local storage. See `MILESTONE-4.md` for final results and limitations.

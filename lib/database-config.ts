/** Parse without echoing credentials in validation errors. No connection is opened. */
export function parseDatabaseUrl(value: string | undefined) {
  if (!value?.trim())
    throw new Error("DATABASE_URL is required for database access.");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL URL.");
  }
  if (
    !["postgresql:", "postgres:"].includes(url.protocol) ||
    !url.hostname ||
    url.pathname.length <= 1
  ) {
    throw new Error(
      "DATABASE_URL must specify a PostgreSQL host and database.",
    );
  }
  const schema = url.searchParams.get("schema") ?? "public";
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema))
    throw new Error("DATABASE_URL contains an unsupported schema name.");
  // pg does not apply Prisma's schema query parameter itself.
  url.searchParams.delete("schema");
  return { connectionString: url.toString(), schema };
}

export function assertDevelopmentSeedAllowed(env: {
  NODE_ENV?: string;
  ALLOW_DEVELOPMENT_SEED?: string;
}) {
  if (env.NODE_ENV === "production" || env.ALLOW_DEVELOPMENT_SEED !== "true") {
    throw new Error(
      "Development seeding requires ALLOW_DEVELOPMENT_SEED=true and is disabled in production.",
    );
  }
}

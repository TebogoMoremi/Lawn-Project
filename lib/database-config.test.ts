import { describe, expect, it } from "vitest";
import {
  assertDevelopmentSeedAllowed,
  parseDatabaseUrl,
} from "./database-config";

describe("database configuration", () => {
  it("preserves driver options and passes the chosen schema separately", () => {
    const result = parseDatabaseUrl(
      "postgresql://demo:sample@localhost:5432/lawnflow_test?schema=testing&sslmode=require",
    );
    expect(result.schema).toBe("testing");
    const url = new URL(result.connectionString);
    expect(url.searchParams.get("schema")).toBeNull();
    expect(url.searchParams.get("sslmode")).toBe("require");
    expect(url.pathname).toBe("/lawnflow_test");
  });
  it("defaults only the schema, never a database connection", () => {
    expect(parseDatabaseUrl("postgres://localhost/lawnflow_test").schema).toBe(
      "public",
    );
    expect(() => parseDatabaseUrl(undefined)).toThrow(
      "DATABASE_URL is required",
    );
  });
  it.each([
    "",
    "not-a-url",
    "https://demo:secret@example.com/db",
    "postgresql://localhost",
    "postgresql://localhost/db?schema=bad%3Bsql",
  ])("rejects invalid configuration without exposing it", (value) => {
    let message = "";
    try {
      parseDatabaseUrl(value);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("DATABASE_URL");
    expect(message).not.toContain("secret");
    if (value) expect(message).not.toContain(value);
  });
});

describe("development seed guard", () => {
  it.each([
    {},
    { NODE_ENV: "development" },
    { ALLOW_DEVELOPMENT_SEED: "false" },
    { NODE_ENV: "production", ALLOW_DEVELOPMENT_SEED: "true" },
  ])("refuses a seed without explicit non-production opt-in: %j", (env) => {
    expect(() => assertDevelopmentSeedAllowed(env)).toThrow();
  });
  it("allows an explicitly opted-in development or isolated test run", () => {
    for (const NODE_ENV of ["development", "test"]) {
      expect(() =>
        assertDevelopmentSeedAllowed({
          NODE_ENV,
          ALLOW_DEVELOPMENT_SEED: "true",
        }),
      ).not.toThrow();
    }
  });
});

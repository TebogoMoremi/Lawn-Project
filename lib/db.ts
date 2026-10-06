import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { parseDatabaseUrl } from "./database-config";

const globalForDb = globalThis as unknown as { lawnflowPrisma?: PrismaClient };
let productionClient: PrismaClient | undefined;

/** Lazy: importing this module never makes the static site depend on a database. */
export function getDb(): PrismaClient {
  const cached =
    process.env.NODE_ENV === "production"
      ? productionClient
      : globalForDb.lawnflowPrisma;
  if (cached) return cached;
  const { connectionString, schema } = parseDatabaseUrl(
    process.env.DATABASE_URL,
  );
  const adapter = new PrismaPg(
    {
      connectionString,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    },
    { schema },
  );
  const client = new PrismaClient({ adapter, log: [], errorFormat: "minimal" });
  if (process.env.NODE_ENV === "production") productionClient = client;
  else globalForDb.lawnflowPrisma = client;
  return client;
}

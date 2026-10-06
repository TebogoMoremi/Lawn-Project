import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import {
  assertDevelopmentSeedAllowed,
  parseDatabaseUrl,
} from "../lib/database-config";
import { serviceSeedData, areaSeedData } from "./seed-data";

async function main() {
  assertDevelopmentSeedAllowed(process.env);
  const { connectionString, schema } = parseDatabaseUrl(
    process.env.DATABASE_URL,
  );
  const db = new PrismaClient({
    adapter: new PrismaPg(
      { connectionString, max: 1, connectionTimeoutMillis: 5000 },
      { schema },
    ),
    log: [],
    errorFormat: "minimal",
  });
  try {
    await db.$transaction(
      async (tx) => {
        for (const service of serviceSeedData) {
          await tx.service.upsert({
            where: { slug: service.slug },
            create: { ...service, active: false },
            update: service,
          });
        }
        for (const { serviceSlugs, ...area } of areaSeedData) {
          const relations = serviceSlugs.map((slug) => ({ slug }));
          await tx.serviceArea.upsert({
            where: { slug: area.slug },
            create: {
              ...area,
              active: false,
              services: { connect: relations },
            },
            update: { ...area, services: { set: relations } },
          });
        }
      },
      { timeout: 30000 },
    );
    console.info(
      `Development reference data seeded: ${serviceSeedData.length} services, ${areaSeedData.length} planned areas. Existing activation flags preserved.`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch(() => {
  // Driver errors can include connection details or query values; do not print them.
  console.error(
    "Development seed failed. Check the opt-in flag, database configuration and applied migrations. No connection details are logged.",
  );
  process.exitCode = 1;
});

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Do not require a URL for offline validate/generate/build commands.
  // Database commands fail rather than silently using a fallback database.
  datasource: { url: process.env.DATABASE_URL },
});

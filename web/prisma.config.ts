import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

/** Pooled Neon URLs (`-pooler` host) cannot take Prisma’s migration advisory lock → P1002 timeouts. */
const prismaCliUrl =
  process.env["DIRECT_URL"]?.trim() || process.env["DATABASE_URL"]?.trim();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: prismaCliUrl,
  },
});

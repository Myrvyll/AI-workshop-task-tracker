import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

/**
 * PgBouncer / Neon pooler cannot take Prisma’s migration advisory lock (P1002).
 * Prefer an explicit direct URL; otherwise derive Neon direct host from a pooled `DATABASE_URL`.
 */
function tryNeonDirectFromPooled(databaseUrl: string): string | undefined {
  const trimmed = databaseUrl.trim();
  if (!trimmed.includes("neon.tech") || !trimmed.includes("-pooler")) {
    return undefined;
  }
  try {
    const normalized = trimmed.replace(/^postgres:\/\//, "postgresql://");
    const u = new URL(normalized);
    if (!u.hostname.includes("-pooler")) return undefined;
    u.hostname = u.hostname.replace("-pooler.", ".");
    return u.toString();
  } catch {
    return undefined;
  }
}

function prismaCliDatasourceUrl(): string | undefined {
  const explicit = [
    process.env["DIRECT_URL"],
    process.env["DATABASE_URL_UNPOOLED"],
    process.env["POSTGRES_URL_NON_POOLING"],
    process.env["DATABASE_DIRECT_URL"],
  ];
  for (const raw of explicit) {
    const u = raw?.trim();
    if (u) return u;
  }

  const databaseUrl = process.env["DATABASE_URL"]?.trim();
  if (!databaseUrl) return undefined;

  return tryNeonDirectFromPooled(databaseUrl) ?? databaseUrl;
}

const prismaCliUrl = prismaCliDatasourceUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: prismaCliUrl,
  },
});

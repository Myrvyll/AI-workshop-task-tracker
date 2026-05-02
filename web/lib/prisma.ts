import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

/**
 * After schema changes, `next dev` can keep a cached `PrismaClient` on `globalThis` that was built
 * before new models existed — then `getPrisma().tag` is undefined and `.findMany` throws.
 */
function prismaClientHasCurrentModels(client: PrismaClient): boolean {
  return typeof (client as { tag?: { findMany?: unknown } }).tag?.findMany === "function";
}

/** Avoids pg's sslmode=require deprecation warning (treated as verify-full today). */
function normalizeDatabaseUrl(url: string): string {
  return url.replace(
    /([?&])sslmode=(require|prefer|verify-ca)\b/gi,
    (_m, sep: string) => `${sep}sslmode=verify-full`,
  );
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({ connectionString: normalizeDatabaseUrl(connectionString) });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && prismaClientHasCurrentModels(cached)) {
    return cached;
  }
  if (cached) {
    void cached.$disconnect().catch(() => {});
  }
  globalForPrisma.prisma = createPrismaClient();
  return globalForPrisma.prisma;
}

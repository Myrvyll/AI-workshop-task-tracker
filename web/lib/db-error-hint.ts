/**
 * Classify Prisma/pg failures so the UI can show a useful hint (not only "cannot connect").
 */
export function describeDbFailure(err: unknown): {
  kind:
    | "missing_url"
    | "schema_outdated"
    | "stale_client"
    | "auth"
    | "connection"
    | "unknown";
  technicalMessage: string;
} {
  const technicalMessage =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Unknown error";

  if (/DATABASE_URL is not set/i.test(technicalMessage)) {
    return { kind: "missing_url", technicalMessage };
  }

  if (/Cannot read properties of undefined \(reading 'findMany'\)/i.test(technicalMessage)) {
    return { kind: "stale_client", technicalMessage };
  }

  if (
    /does not exist in the current database|P2021|relation .+ does not exist|table .+ does not exist/i.test(
      technicalMessage,
    )
  ) {
    return { kind: "schema_outdated", technicalMessage };
  }

  if (/password authentication failed|28P01|authentication failed/i.test(technicalMessage)) {
    return { kind: "auth", technicalMessage };
  }

  if (/ECONNREFUSED|ETIMEDOUT|ENOTFOUND|timeout expired|Connection terminated/i.test(technicalMessage)) {
    return { kind: "connection", technicalMessage };
  }

  return { kind: "unknown", technicalMessage };
}

export function getTursoConfig() {
  const rawUrl = process.env.TURSO_DATABASE_URL?.trim();
  const rawToken = process.env.TURSO_AUTH_TOKEN;

  if (!rawUrl || !rawToken) {
    return null;
  }

  const url = rawUrl.replace(/\s+/g, "");
  const authToken = rawToken
    .trim()
    .replace(/^Bearer\s+/i, "")
    .replace(/\s+/g, "");

  if (!url.startsWith("libsql://")) {
    throw new Error("TURSO_DATABASE_URL must start with libsql://");
  }

  if (!authToken) {
    throw new Error("TURSO_AUTH_TOKEN is empty after normalization");
  }

  return { url, authToken };
}

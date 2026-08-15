import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { getTursoConfig } from "./turso-env";

export function createPrismaClient() {
  const turso = getTursoConfig();

  if (turso) {
    const adapter = new PrismaLibSql(turso);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

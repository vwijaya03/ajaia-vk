import { describe, expect, it } from "vitest";
import { getTursoConfig } from "@/lib/turso-env";

describe("getTursoConfig", () => {
  it("strips Bearer prefix and whitespace from token", () => {
    process.env.TURSO_DATABASE_URL = " libsql://example.turso.io\n";
    process.env.TURSO_AUTH_TOKEN = "Bearer eyJ.test.token\n";

    const config = getTursoConfig();

    expect(config).toEqual({
      url: "libsql://example.turso.io",
      authToken: "eyJ.test.token",
    });

    delete process.env.TURSO_DATABASE_URL;
    delete process.env.TURSO_AUTH_TOKEN;
  });
});

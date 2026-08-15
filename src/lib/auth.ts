import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./db";

const SESSION_COOKIE = "ajaia_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret";
}

function sign(value: string): string {
  const signature = createHmac("sha256", getSecret()).update(value).digest("hex");
  return `${value}.${signature}`;
}

function verify(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const value = signed.slice(0, lastDot);
  const signature = signed.slice(lastDot + 1);
  const expected = createHmac("sha256", getSecret()).update(value).digest("hex");

  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  return value;
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}:${expiresAt}`;
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sign(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const payload = verify(raw);
  if (!payload) return null;

  const [userId, expiresAtRaw] = payload.split(":");
  const expiresAt = Number(expiresAtRaw);
  if (!userId || !expiresAt || Date.now() > expiresAt) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

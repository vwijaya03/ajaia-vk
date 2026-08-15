import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userCanAccessDocument } from "@/lib/documents";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access || access.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can manage sharing." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { NOT: { id: user.id } },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });

  return NextResponse.json({ users, shares: document?.shares ?? [] });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access || access.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can share documents." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const userId = typeof body.userId === "string" ? body.userId : "";
    if (!userId || userId === user.id) {
      return NextResponse.json({ error: "Select a valid user to share with." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const share = await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId: id, userId } },
      update: {},
      create: { documentId: id, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(share, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to share document." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access || access.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can manage sharing." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  await prisma.documentShare.deleteMany({
    where: { documentId: id, userId },
  });

  return NextResponse.json({ ok: true });
}

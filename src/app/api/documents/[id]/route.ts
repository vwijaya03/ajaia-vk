import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userCanAccessDocument } from "@/lib/documents";
import { prisma } from "@/lib/db";
import { isNonEmptyString, sanitizeTitle } from "@/lib/validation";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
      attachments: {
        select: { id: true, filename: true, mimeType: true, size: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return NextResponse.json({
    ...document,
    isOwner: access.ownerId === user.id,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const data: { title?: string; content?: string } = {};

    if (body.title !== undefined) {
      if (!isNonEmptyString(body.title)) {
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      }
      data.title = sanitizeTitle(body.title);
    }

    if (body.content !== undefined) {
      if (typeof body.content !== "string") {
        return NextResponse.json({ error: "Invalid content." }, { status: 400 });
      }
      data.content = body.content;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const document = await prisma.document.update({
      where: { id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    return NextResponse.json({ ...document, isOwner: access.ownerId === user.id });
  } catch {
    return NextResponse.json({ error: "Failed to update document." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access || access.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the owner can delete this document." }, { status: 403 });
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

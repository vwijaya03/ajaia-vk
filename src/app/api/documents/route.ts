import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { emptyDocumentContent, listDocumentsForUser } from "@/lib/documents";
import { prisma } from "@/lib/db";
import { isNonEmptyString, sanitizeTitle } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await listDocumentsForUser(user.id);
  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const title = isNonEmptyString(body.title) ? sanitizeTitle(body.title) : "Untitled document";
    const content =
      typeof body.content === "string" && body.content.length > 0
        ? body.content
        : emptyDocumentContent();

    const document = await prisma.document.create({
      data: { title, content, ownerId: user.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        shares: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { attachments: true } },
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create document." }, { status: 500 });
  }
}

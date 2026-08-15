import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { emptyDocumentContent, textToTipTapContent, userCanAccessDocument } from "@/lib/documents";
import { prisma } from "@/lib/db";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  isAllowedUpload,
  MAX_UPLOAD_BYTES,
  sanitizeTitle,
} from "@/lib/validation";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const mode = formData.get("mode") === "attach" ? "attach" : "import";
    const documentIdRaw = formData.get("documentId");
    const documentId = typeof documentIdRaw === "string" ? documentIdRaw : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File exceeds 512 KB limit." }, { status: 400 });
    }

    if (!isAllowedUpload(file.name, file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type. Allowed: ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const text = await file.text();
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

    if (mode === "attach") {
      if (!documentId) {
        return NextResponse.json({ error: "documentId is required for attachments." }, { status: 400 });
      }

      const access = await userCanAccessDocument(user.id, documentId);
      if (!access) {
        return NextResponse.json({ error: "Document not found." }, { status: 404 });
      }

      const attachment = await prisma.attachment.create({
        data: {
          documentId,
          filename: file.name,
          mimeType: file.type || "text/plain",
          size: file.size,
          data: base64,
        },
      });

      return NextResponse.json(
        {
          id: attachment.id,
          filename: attachment.filename,
          mimeType: attachment.mimeType,
          size: attachment.size,
          createdAt: attachment.createdAt,
        },
        { status: 201 },
      );
    }

    const title = sanitizeTitle(file.name.replace(/\.(txt|md)$/i, "") || "Imported document");
    const content = text.trim() ? textToTipTapContent(text) : emptyDocumentContent();

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
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

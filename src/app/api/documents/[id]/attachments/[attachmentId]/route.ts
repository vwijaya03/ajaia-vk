import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userCanAccessDocument } from "@/lib/documents";
import { prisma } from "@/lib/db";

type RouteContext = { params: Promise<{ id: string; attachmentId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, attachmentId } = await context.params;
  const access = await userCanAccessDocument(user.id, id);
  if (!access) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const attachment = await prisma.attachment.findFirst({
    where: { id: attachmentId, documentId: id },
  });

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
  }

  const buffer = Buffer.from(attachment.data, "base64");
  const safeFilename = attachment.filename.replace(/[^\w.\-() ]/g, "_");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": attachment.mimeType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safeFilename}"`,
      "Content-Length": String(buffer.length),
    },
  });
}

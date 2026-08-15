import { prisma } from "./db";

export async function userCanAccessDocument(userId: string, documentId: string) {
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      OR: [{ ownerId: userId }, { shares: { some: { userId } } }],
    },
    select: { id: true, ownerId: true },
  });
  return doc;
}

export async function listDocumentsForUser(userId: string) {
  const owned = await prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { attachments: true } },
    },
  });

  const shared = await prisma.document.findMany({
    where: {
      shares: { some: { userId } },
      NOT: { ownerId: userId },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: { include: { user: { select: { id: true, name: true, email: true } } } },
      _count: { select: { attachments: true } },
    },
  });

  return { owned, shared };
}

export function emptyDocumentContent() {
  return JSON.stringify({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
}

export function textToTipTapContent(text: string) {
  const paragraphs = text.split(/\r?\n/).map((line) => ({
    type: "paragraph",
    content: line ? [{ type: "text", text: line }] : [],
  }));

  return JSON.stringify({
    type: "doc",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  });
}

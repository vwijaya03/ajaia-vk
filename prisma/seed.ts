import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

const SEED_USERS = [
  { email: "alice@ajaia.test", name: "Alice Chen", password: "password123" },
  { email: "bob@ajaia.test", name: "Bob Rivera", password: "password123" },
  { email: "carol@ajaia.test", name: "Carol Kim", password: "password123" },
];

async function main() {
  for (const user of SEED_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, password: passwordHash },
      create: {
        email: user.email,
        name: user.name,
        password: passwordHash,
      },
    });
  }

  const alice = await prisma.user.findUniqueOrThrow({ where: { email: "alice@ajaia.test" } });
  const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@ajaia.test" } });

  const welcomeContent = JSON.stringify({
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "Welcome to Ajaia Docs" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "This is a " },
          { type: "text", marks: [{ type: "bold" }], text: "collaborative document editor" },
          { type: "text", text: " built for the Ajaia assignment." },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Edit with rich formatting from the toolbar" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Share documents with teammates from the Share button" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Import .txt or .md files from the dashboard" }],
              },
            ],
          },
        ],
      },
    ],
  });

  const doc = await prisma.document.upsert({
    where: { id: "seed-welcome-doc" },
    update: {},
    create: {
      id: "seed-welcome-doc",
      title: "Getting Started",
      content: welcomeContent,
      ownerId: alice.id,
    },
  });

  await prisma.documentShare.upsert({
    where: {
      documentId_userId: { documentId: doc.id, userId: bob.id },
    },
    update: {},
    create: { documentId: doc.id, userId: bob.id },
  });

  console.log("Seed complete:");
  console.log("  Users: alice@ajaia.test, bob@ajaia.test, carol@ajaia.test");
  console.log("  Password for all: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

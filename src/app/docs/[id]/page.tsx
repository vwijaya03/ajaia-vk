import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DocumentEditorClient } from "@/components/DocumentEditorClient";

type PageProps = { params: Promise<{ id: string }> };

export default async function DocumentPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  return <DocumentEditorClient documentId={id} user={user} />;
}

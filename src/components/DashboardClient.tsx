"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, LogOut, Upload, Users } from "lucide-react";

type User = { id: string; email: string; name: string };

type DocumentSummary = {
  id: string;
  title: string;
  updatedAt: string;
  owner: User;
  shares: { user: User }[];
  _count: { attachments: number };
};

type DocumentsResponse = {
  owned: DocumentSummary[];
  shared: DocumentSummary[];
};

export function DashboardClient({ user }: { user: User }) {
  const router = useRouter();
  const [owned, setOwned] = useState<DocumentSummary[]>([]);
  const [shared, setShared] = useState<DocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to load documents");
      const data: DocumentsResponse = await res.json();
      setOwned(data.owned);
      setShared(data.shared);
    } catch {
      setError("Could not load documents. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  async function createDocument() {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Untitled document" }),
    });
    if (!res.ok) return;
    const doc = await res.json();
    router.push(`/docs/${doc.id}`);
  }

  async function handleImport(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "import");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      router.push(`/docs/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-medium text-indigo-600">Ajaia Docs</p>
            <h1 className="text-xl font-semibold text-zinc-900">Your documents</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-500 sm:inline">{user.name}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createDocument}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <FileText size={16} />
              New document
            </button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
              <Upload size={16} />
              {uploading ? "Importing…" : "Import .txt / .md"}
              <input
                type="file"
                accept=".txt,.md,text/plain,text/markdown"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleImport(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p className="text-sm text-zinc-500">Supported imports: .txt and .md (max 512 KB)</p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-zinc-500">Loading documents…</p>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            <DocumentSection
              title="Owned by you"
              emptyMessage="No documents yet. Create one or import a file."
              documents={owned}
              badge="Owner"
              badgeClass="bg-emerald-100 text-emerald-800"
            />
            <DocumentSection
              title="Shared with you"
              emptyMessage="No shared documents yet. Ask a teammate to share one with you."
              documents={shared}
              badge="Shared"
              badgeClass="bg-sky-100 text-sky-800"
              showOwner
            />
          </div>
        )}

        <section className="mt-10 rounded-xl border border-dashed border-zinc-300 bg-white p-5">
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 text-indigo-600" size={18} />
            <div>
              <h2 className="font-medium text-zinc-900">Demo accounts</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Sign in as <strong>alice@ajaia.test</strong> (owner) or{" "}
                <strong>bob@ajaia.test</strong> (has shared access to Getting Started). Password:{" "}
                <code className="rounded bg-zinc-100 px-1">password123</code>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function DocumentSection({
  title,
  emptyMessage,
  documents,
  badge,
  badgeClass,
  showOwner = false,
}: {
  title: string;
  emptyMessage: string;
  documents: DocumentSummary[];
  badge: string;
  badgeClass: string;
  showOwner?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {documents.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {documents.map((doc) => (
            <li key={doc.id}>
              <a
                href={`/docs/${doc.id}`}
                className="block rounded-xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-zinc-900">{doc.title}</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Updated {new Date(doc.updatedAt).toLocaleString()}
                      {showOwner && ` · Owner: ${doc.owner.name}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass}`}>
                    {badge}
                  </span>
                </div>
                {doc._count.attachments > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">{doc._count.attachments} attachment(s)</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

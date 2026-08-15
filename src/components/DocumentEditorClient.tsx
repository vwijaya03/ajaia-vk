"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Paperclip, Save, Share2, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { ShareDialog } from "./ShareDialog";

type User = { id: string; email: string; name: string };

type Attachment = {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type DocumentDetail = {
  id: string;
  title: string;
  content: string;
  isOwner: boolean;
  owner: User;
  shares: { user: User }[];
  attachments: Attachment[];
  updatedAt: string;
};

export function DocumentEditorClient({
  documentId,
  user,
}: {
  documentId: string;
  user: User;
}) {
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadDocument = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${documentId}`);
      if (!res.ok) throw new Error("Document not found");
      const data: DocumentDetail = await res.json();
      setDoc(data);
      setTitle(data.title);
      setContent(data.content);
      setDirty(false);
    } catch {
      setError("Could not load this document.");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  async function saveDocument(nextTitle = title, nextContent = content) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle, content: nextContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setDoc((prev) => (prev ? { ...prev, ...data } : prev));
      setSavedAt(new Date().toLocaleTimeString());
      setDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteDocument() {
    if (!confirm("Delete this document permanently?")) return;
    const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
  }

  async function attachFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "attach");
    formData.append("documentId", documentId);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Attachment upload failed");
      return;
    }
    await loadDocument();
  }

  if (loading) {
    return <div className="p-8 text-sm text-zinc-500">Loading document…</div>;
  }

  if (!doc) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error || "Document unavailable."}</p>
        <Link href="/dashboard" className="mt-4 inline-block text-indigo-600">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0 flex-1">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                disabled={!doc.isOwner}
                className="w-full truncate border-none bg-transparent text-lg font-semibold text-zinc-900 outline-none disabled:cursor-not-allowed"
                aria-label="Document title"
              />
              <p className="text-xs text-zinc-500">
                {doc.isOwner ? "You own this document" : `Shared by ${doc.owner.name}`}
                {savedAt && ` · Saved at ${savedAt}`}
                {dirty && " · Unsaved changes"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => saveDocument()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving…" : "Save"}
            </button>

            {doc.isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50">
                  <Paperclip size={16} />
                  Attach file
                  <input
                    type="file"
                    accept=".txt,.md,text/plain,text/markdown"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void attachFile(file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={deleteDocument}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-6">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <RichTextEditor
          content={content}
          editable
          onChange={(json) => {
            setContent(json);
            setDirty(true);
          }}
        />

        {doc.attachments.length > 0 && (
          <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-zinc-900">Attachments</h2>
            <ul className="mt-2 space-y-2">
              {doc.attachments.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 text-sm text-zinc-600"
                >
                  <span className="truncate">{file.filename}</span>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-zinc-400">{Math.round(file.size / 1024)} KB</span>
                    <a
                      href={`/api/documents/${documentId}/attachments/${file.id}`}
                      download={file.filename}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <Download size={14} />
                      Download
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      {shareOpen && (
        <ShareDialog
          documentId={documentId}
          existingShares={doc.shares.map((s) => s.user)}
          onClose={() => setShareOpen(false)}
          onUpdated={loadDocument}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

type User = { id: string; email: string; name: string };

type ShareDialogProps = {
  documentId: string;
  existingShares: User[];
  onClose: () => void;
  onUpdated: () => void;
};

export function ShareDialog({
  documentId,
  existingShares,
  onClose,
  onUpdated,
}: ShareDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [shares, setShares] = useState<User[]>(existingShares);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/documents/${documentId}/share`);
      if (!res.ok) {
        setError("Could not load sharing options.");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setShares(data.shares.map((s: { user: User }) => s.user));
      setLoading(false);
    }
    load();
  }, [documentId]);

  async function grantAccess() {
    if (!selectedUserId) return;
    setError("");
    const res = await fetch(`/api/documents/${documentId}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not share document");
      return;
    }
    setShares((prev) => [...prev, data.user]);
    setSelectedUserId("");
    onUpdated();
  }

  async function revokeAccess(userId: string) {
    const res = await fetch(`/api/documents/${documentId}/share?userId=${userId}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setShares((prev) => prev.filter((u) => u.id !== userId));
    onUpdated();
  }

  const availableUsers = users.filter((u) => !shares.some((s) => s.id === u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Share document</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <>
            <div className="flex gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Select a teammate…</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={grantAccess}
                disabled={!selectedUserId}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5">
              <h3 className="text-sm font-medium text-zinc-700">People with access</h3>
              {shares.length === 0 ? (
                <p className="mt-2 text-sm text-zinc-500">Not shared with anyone yet.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {shares.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium text-zinc-900">{user.name}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => revokeAccess(user.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

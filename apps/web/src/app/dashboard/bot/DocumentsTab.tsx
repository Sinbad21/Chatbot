"use client";

import React, { useEffect, useState } from "react";

type DocumentRecord = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type Props = {
  botId: string;
  apiBaseUrl: string;
};

export default function DocumentsTab({ botId, apiBaseUrl }: Props) {
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadDocs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/documents`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Impossibile caricare i documenti");
      }

      const data: DocumentRecord[] = await res.json();
      setDocs(data);
    } catch (err: any) {
      setError(err.message || "Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        throw new Error("Errore salvataggio documento");
      }

      setTitle("");
      setContent("");
      await loadDocs();
    } catch (err: any) {
      setError(err.message || "Errore salvataggio documento");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || "Errore eliminazione documento");
    }
  }

  useEffect(() => {
    loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  return (
    <div className="flex flex-col gap-24">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border p-16 flex flex-col gap-12 bg-white shadow-sm"
      >
        <div className="text-lg font-semibold">Aggiungi documento conoscenza</div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Titolo</label>
          <input
            className="border rounded-md px-8 py-6 text-sm"
            placeholder="Es. Listino prezzi ottobre"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">
            Contenuto (testo che il bot deve sapere)
          </label>
          <textarea
            className="border rounded-md px-8 py-6 text-sm min-h-[120px]"
            placeholder="Scrivi/incolla testo qui..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={saving}
          />
          <p className="text-xs text-gray-500">
            Puoi incollare FAQ interne, policy, manuali, ecc.
          </p>
        </div>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white text-sm font-medium rounded-md px-12 py-8 disabled:opacity-50"
        >
          {saving ? "Salvo..." : "Salva documento"}
        </button>
      </form>

      <div className="rounded-xl border p-16 bg-white shadow-sm">
        <div className="text-lg font-semibold mb-12">Documenti caricati</div>

        {loading ? (
          <div className="text-sm text-gray-500">Caricamento…</div>
        ) : docs.length === 0 ? (
          <div className="text-sm text-gray-500">
            Nessun documento ancora. Aggiungine uno sopra.
          </div>
        ) : (
          <ul className="flex flex-col gap-12">
            {docs.map((doc) => (
              <li
                key={doc.id}
                className="border rounded-md p-12 flex flex-col gap-6 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="font-medium">{doc.title}</div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-xs text-red-600 hover:underline"
                    type="button"
                  >
                    Elimina
                  </button>
                </div>

                <div className="text-xs text-gray-700 whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                  {doc.content}
                </div>

                <div className="text-[10px] text-gray-400">
                  {new Date(doc.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

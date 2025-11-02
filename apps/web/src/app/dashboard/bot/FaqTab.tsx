"use client";

import React, { useEffect, useState } from "react";

type FaqRecord = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};

type Props = {
  botId: string;
  apiBaseUrl: string;
};

export default function FaqTab({ botId, apiBaseUrl }: Props) {
  const [faqs, setFaqs] = useState<FaqRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadFaqs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/faqs`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Impossibile caricare le FAQ");
      }

      const data: FaqRecord[] = await res.json();
      setFaqs(data);
    } catch (err: any) {
      setError(err.message || "Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/faqs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ question, answer }),
      });

      if (!res.ok) {
        throw new Error("Errore salvataggio FAQ");
      }

      setQuestion("");
      setAnswer("");
      await loadFaqs();
    } catch (err: any) {
      setError(err.message || "Errore salvataggio FAQ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/faqs/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    } catch (err: any) {
      setError(err.message || "Errore eliminazione FAQ");
    }
  }

  useEffect(() => {
    loadFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  return (
    <div className="flex flex-col gap-24">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border p-16 flex flex-col gap-12 bg-white shadow-sm"
      >
        <div className="text-lg font-semibold">Aggiungi FAQ</div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Domanda</label>
          <input
            className="border rounded-md px-8 py-6 text-sm"
            placeholder="Es. Quali sono gli orari di supporto?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Risposta</label>
          <textarea
            className="border rounded-md px-8 py-6 text-sm min-h-[120px]"
            placeholder="Inserisci la risposta dettagliata"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white text-sm font-medium rounded-md px-12 py-8 disabled:opacity-50"
        >
          {saving ? "Salvo..." : "Salva FAQ"}
        </button>
      </form>

      <div className="rounded-xl border p-16 bg-white shadow-sm">
        <div className="text-lg font-semibold mb-12">FAQ configurate</div>

        {loading ? (
          <div className="text-sm text-gray-500">Caricamento…</div>
        ) : faqs.length === 0 ? (
          <div className="text-sm text-gray-500">
            Nessuna FAQ ancora. Aggiungine una sopra.
          </div>
        ) : (
          <ul className="flex flex-col gap-12">
            {faqs.map((faq) => (
              <li
                key={faq.id}
                className="border rounded-md p-12 flex flex-col gap-6 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="font-medium">{faq.question}</div>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="text-xs text-red-600 hover:underline"
                    type="button"
                  >
                    Elimina
                  </button>
                </div>

                <div className="text-xs text-gray-700 whitespace-pre-wrap">
                  {faq.answer}
                </div>

                <div className="text-[10px] text-gray-400">
                  {new Date(faq.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

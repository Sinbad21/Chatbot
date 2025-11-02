"use client";

import React, { useEffect, useMemo, useState } from "react";

type IntentRecord = {
  id: string;
  name: string;
  trainingPhrases: string[];
  response: string;
  createdAt: string;
};

type Props = {
  botId: string;
  apiBaseUrl: string;
};

export default function IntentsTab({ botId, apiBaseUrl }: Props) {
  const [intents, setIntents] = useState<IntentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phrasesText, setPhrasesText] = useState("");
  const [response, setResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phrases = useMemo(
    () =>
      phrasesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [phrasesText],
  );

  function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function loadIntents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/intents`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Impossibile caricare gli intent");
      }

      const data: IntentRecord[] = await res.json();
      setIntents(data);
    } catch (err: any) {
      setError(err.message || "Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || phrases.length === 0 || !response.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/bots/${botId}/intents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name, trainingPhrases: phrases, response }),
      });

      if (!res.ok) {
        throw new Error("Errore salvataggio intent");
      }

      setName("");
      setPhrasesText("");
      setResponse("");
      await loadIntents();
    } catch (err: any) {
      setError(err.message || "Errore salvataggio intent");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/intents/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        throw new Error("Errore durante l'eliminazione");
      }

      setIntents((prev) => prev.filter((intent) => intent.id !== id));
    } catch (err: any) {
      setError(err.message || "Errore eliminazione intent");
    }
  }

  useEffect(() => {
    loadIntents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  return (
    <div className="flex flex-col gap-24">
      <form
        onSubmit={handleCreate}
        className="rounded-xl border p-16 flex flex-col gap-12 bg-white shadow-sm"
      >
        <div className="text-lg font-semibold">Definisci intent</div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Nome intent</label>
          <input
            className="border rounded-md px-8 py-6 text-sm"
            placeholder="Es. Saluto iniziale"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Frasi di training (una per riga)</label>
          <textarea
            className="border rounded-md px-8 py-6 text-sm min-h-[120px]"
            placeholder={"Ciao\nBuongiorno\nHey"}
            value={phrasesText}
            onChange={(e) => setPhrasesText(e.target.value)}
            disabled={saving}
          />
        </div>

        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Risposta del bot</label>
          <textarea
            className="border rounded-md px-8 py-6 text-sm min-h-[120px]"
            placeholder="Messaggio che il bot invierà quando riconosce l'intent"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={saving}
          />
        </div>

        {error && <div className="text-xs text-red-600">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white text-sm font-medium rounded-md px-12 py-8 disabled:opacity-50"
        >
          {saving ? "Salvo..." : "Salva intent"}
        </button>
      </form>

      <div className="rounded-xl border p-16 bg-white shadow-sm">
        <div className="text-lg font-semibold mb-12">Intent configurati</div>

        {loading ? (
          <div className="text-sm text-gray-500">Caricamento…</div>
        ) : intents.length === 0 ? (
          <div className="text-sm text-gray-500">
            Nessun intent ancora. Aggiungine uno sopra.
          </div>
        ) : (
          <ul className="flex flex-col gap-12">
            {intents.map((intent) => (
              <li
                key={intent.id}
                className="border rounded-md p-12 flex flex-col gap-6 bg-gray-50"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="font-medium">{intent.name}</div>
                  <button
                    onClick={() => handleDelete(intent.id)}
                    className="text-xs text-red-600 hover:underline"
                    type="button"
                  >
                    Elimina
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {intent.trainingPhrases.map((phrase) => (
                    <span
                      key={phrase}
                      className="px-2 py-1 bg-white border border-gray-200 rounded"
                    >
                      {phrase}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-700 whitespace-pre-wrap">
                  {intent.response}
                </div>

                <div className="text-[10px] text-gray-400">
                  {new Date(intent.createdAt).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

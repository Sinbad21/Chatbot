"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Bot {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  systemPrompt: string;
  welcomeMessage: string;
  color: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    conversations: number;
    documents: number;
    intents: number;
    faqs: number;
  };
}

type Props = {
  botId: string;
};

export default function BotOverviewTab({ botId }: Props) {
  const router = useRouter();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBot = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!token) {
          router.push("/auth/login");
          return;
        }

        if (!apiUrl) {
          throw new Error("API URL not configured");
        }

        const response = await fetch(`${apiUrl}/api/v1/bots/${botId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bot");
        }

        const data = await response.json();
        setBot(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bot");
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId, router]);

  const handlePublishToggle = async () => {
    if (!bot) return;

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token || !apiUrl) {
        throw new Error("Invalid settings");
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${bot.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ published: !bot.published }),
      });

      if (!response.ok) {
        throw new Error("Failed to update bot");
      }

      setBot({ ...bot, published: !bot.published });
    } catch (err: any) {
      setError(err.message || "Failed to update bot");
    }
  };

  const handleDelete = async () => {
    if (!bot || !confirm(`Are you sure you want to delete "${bot.name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token || !apiUrl) {
        throw new Error("Invalid settings");
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${bot.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete bot");
      }

      router.push("/dashboard/bots");
    } catch (err: any) {
      setError(err.message || "Failed to delete bot");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[240px]">
        <div className="text-gray-800 font-medium">Loading bot details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (!bot) {
    return null;
  }

  const widgetCode = `<script src="https://chatbot-studio.pages.dev/widget.js"></script>
<script>
  ChatbotWidget.init({
    botId: '${bot.id}',
    apiUrl: '${process.env.NEXT_PUBLIC_API_URL}'
  });
</script>`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{bot.name}</h1>
              {bot.published ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Published
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  Draft
                </span>
              )}
            </div>
            {bot.description && (
              <p className="text-gray-800 mb-4">{bot.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/dashboard/bot?id=${bot.id}&edit=true`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                Edit
              </button>
              <button
                onClick={handlePublishToggle}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium"
              >
                {bot.published ? "Unpublish" : "Publish"}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => router.push("/dashboard/bots")}
                className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium"
              >
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Conversations</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.conversations}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Documents</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.documents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">Intents</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.intents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-800 font-medium mb-2">FAQs</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.faqs}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Theme Color</label>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: bot.color }}
              />
              <span className="text-gray-900 font-mono font-medium">{bot.color}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Welcome Message</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium">{bot.welcomeMessage}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">System Prompt</label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg font-medium whitespace-pre-wrap">
              {bot.systemPrompt}
            </p>
          </div>
        </div>
      </div>

      {bot.published && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Widget Embed Code</h2>
          <p className="text-gray-800 mb-3 font-medium">
            Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
          </p>
          <pre className="bg-gray-900 text-white text-xs p-4 rounded-lg overflow-x-auto">
            {widgetCode}
          </pre>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Metadata</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-800 font-medium">Bot ID:</span>
            <span className="text-gray-900 font-mono text-sm font-medium">{bot.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-800 font-medium">Created:</span>
            <span className="text-gray-900 font-medium">
              {new Date(bot.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-800 font-medium">Last Updated:</span>
            <span className="text-gray-900 font-medium">
              {new Date(bot.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

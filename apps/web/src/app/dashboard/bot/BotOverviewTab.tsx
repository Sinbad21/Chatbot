"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Upload, Check, AlertCircle } from "lucide-react";

interface Bot {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  logoUrl: string | null;
  systemPrompt: string;
  welcomeMessage: string;
  model: string;
  color: string;
  theme: {
    bg?: string;
    myText?: string;
    myBubble?: string;
    botText?: string;
    botBubble?: string;
    topbarBg?: string;
    topbarText?: string;
  } | null;
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

type ToastType = "success" | "error" | "info";

const MODELS = [
  { value: "gpt-5-mini", label: "GPT-5 Mini (Fast & Cost-effective)" },
  { value: "gpt-4o", label: "GPT-4o (Advanced)" },
  { value: "claude-3.5-sonnet", label: "Claude 3.5 Sonnet" },
  { value: "llama-3.1-70B", label: "Llama 3.1 70B" },
];

export default function BotOverviewTab({ botId }: Props) {
  const router = useRouter();
  const [bot, setBot] = useState<Bot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Editable fields
  const [systemPrompt, setSystemPrompt] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [model, setModel] = useState("gpt-5-mini");
  const [theme, setTheme] = useState({
    bg: "#ffffff",
    myText: "#000000",
    myBubble: "#4F46E5",
    botText: "#000000",
    botBubble: "#F3F4F6",
    topbarBg: "#4F46E5",
    topbarText: "#ffffff",
  });

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Debounce timers
  const promptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const themeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

        // Initialize editable fields
        setSystemPrompt(data.systemPrompt || "");
        setWelcomeMessage(data.welcomeMessage || "");
        setModel(data.model || "gpt-5-mini");

        if (data.theme) {
          setTheme({
            bg: data.theme.bg || "#ffffff",
            myText: data.theme.myText || "#000000",
            myBubble: data.theme.myBubble || "#4F46E5",
            botText: data.theme.botText || "#000000",
            botBubble: data.theme.botBubble || "#F3F4F6",
            topbarBg: data.theme.topbarBg || "#4F46E5",
            topbarText: data.theme.topbarText || "#ffffff",
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load bot");
      } finally {
        setLoading(false);
      }
    };

    fetchBot();
  }, [botId, router]);

  const updateBot = async (updates: Partial<Bot>) => {
    try {
      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token || !apiUrl) {
        throw new Error("Invalid settings");
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${botId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update bot");
      }

      const updated = await response.json();
      setBot(updated);
      showToast("Saved successfully", "success");
      return updated;
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
      throw err;
    }
  };

  // Debounced save for system prompt
  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value);

    if (promptTimerRef.current) {
      clearTimeout(promptTimerRef.current);
    }

    promptTimerRef.current = setTimeout(() => {
      updateBot({ systemPrompt: value });
    }, 500);
  };

  // Debounced save for welcome message
  const handleWelcomeMessageChange = (value: string) => {
    setWelcomeMessage(value);

    if (welcomeTimerRef.current) {
      clearTimeout(welcomeTimerRef.current);
    }

    welcomeTimerRef.current = setTimeout(() => {
      updateBot({ welcomeMessage: value });
    }, 500);
  };

  // Immediate save for model
  const handleModelChange = async (value: string) => {
    setModel(value);
    await updateBot({ model: value } as any);
  };

  // Debounced save for theme
  const handleThemeChange = (key: string, value: string) => {
    const newTheme = { ...theme, [key]: value };
    setTheme(newTheme);

    if (themeTimerRef.current) {
      clearTimeout(themeTimerRef.current);
    }

    themeTimerRef.current = setTimeout(() => {
      updateBot({ theme: newTheme } as any);
    }, 500);
  };

  // Logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file", "error");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be less than 2MB", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("logo", file);

      const token = localStorage.getItem("accessToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!token || !apiUrl) {
        throw new Error("Invalid settings");
      }

      const response = await fetch(`${apiUrl}/api/v1/bots/${botId}/logo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload logo");
      }

      const { logoUrl } = await response.json();
      setBot(bot ? { ...bot, logoUrl } : null);
      showToast("Logo uploaded successfully", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to upload logo", "error");
    }
  };

  const handlePublishToggle = async () => {
    if (!bot) return;
    await updateBot({ published: !bot.published });
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
      showToast(err.message || "Failed to delete bot", "error");
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

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-green-100 border border-green-300 text-green-800"
              : toast.type === "error"
              ? "bg-red-100 border border-red-300 text-red-800"
              : "bg-blue-100 border border-blue-300 text-blue-800"
          }`}
        >
          {toast.type === "success" && <Check size={20} />}
          {toast.type === "error" && <AlertCircle size={20} />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Logo */}
            <div className="relative">
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden">
                {bot.logoUrl ? (
                  <img src={bot.logoUrl} alt={bot.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {bot.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg">
                <Upload size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>

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
                <p className="text-gray-600 text-sm">{bot.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePublishToggle}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
            >
              {bot.published ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 font-medium mb-2">Conversations</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.conversations}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 font-medium mb-2">Documents</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.documents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 font-medium mb-2">Intents</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.intents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 font-medium mb-2">FAQs</div>
          <div className="text-3xl font-bold text-indigo-600">{bot._count.faqs}</div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">AI Model</h2>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-600 mt-2">
          Select the AI model that will power your chatbot responses
        </p>
      </div>

      {/* Prompts */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Prompts & Messages</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Welcome Message
            </label>
            <input
              type="text"
              value={welcomeMessage}
              onChange={(e) => handleWelcomeMessageChange(e.target.value)}
              placeholder="Hi! How can I help you today?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto-saves after 500ms of inactivity
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Define the bot's personality and behavior. Auto-saves after 500ms.
            </p>
          </div>
        </div>
      </div>

      {/* Theme Customization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Chat Theme</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries({
            bg: "Background",
            myText: "User Text Color",
            myBubble: "User Bubble Color",
            botText: "Bot Text Color",
            botBubble: "Bot Bubble Color",
            topbarBg: "Header Background",
            topbarText: "Header Text Color",
          }).map(([key, label]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme[key as keyof typeof theme]}
                  onChange={(e) => handleThemeChange(key, e.target.value)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={theme[key as keyof typeof theme]}
                  onChange={(e) => handleThemeChange(key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Changes auto-save after 500ms. Preview will be visible in the chat widget.
        </p>
      </div>

      {/* Widget Code */}
      {bot.published && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Widget Embed Code</h2>
          <p className="text-gray-600 mb-3 text-sm">
            Copy this code and paste it before the closing &lt;/body&gt; tag on your website:
          </p>
          <pre className="bg-gray-900 text-white text-xs p-4 rounded-lg overflow-x-auto">
{`<script src="https://chatbot-studio.pages.dev/widget.js"></script>
<script>
  ChatbotWidget.init({
    botId: '${bot.id}',
    apiUrl: '${process.env.NEXT_PUBLIC_API_URL}'
  });
</script>`}
          </pre>
        </div>
      )}
    </div>
  );
}

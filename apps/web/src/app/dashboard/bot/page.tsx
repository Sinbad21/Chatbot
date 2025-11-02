"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BotOverviewTab from "./BotOverviewTab";
import DocumentsTab from "./DocumentsTab";
import IntentsTab from "./IntentsTab";
import FaqTab from "./FaqTab";

type TabKey = "overview" | "documents" | "intents" | "faqs";

function InnerBotPage() {
  const searchParams = useSearchParams();
  const botId = searchParams.get("botId") || "";
  const [activeTab, setActiveTab] = useState<TabKey>("documents");

  const apiBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || "";
  }, []);

  if (!botId) {
    return (
      <div className="p-16 text-sm text-red-600">Bot ID mancante (?botId=...)</div>
    );
  }

  if (!apiBaseUrl) {
    return (
      <div className="p-16 text-sm text-red-600">
        Configura NEXT_PUBLIC_API_BASE_URL per usare le API.
      </div>
    );
  }

  return (
    <div className="p-16 flex flex-col gap-16">
      <div className="flex gap-8 border-b pb-8 text-sm">
        <button
          className={
            activeTab === "overview"
              ? "font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={
            activeTab === "documents"
              ? "font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
        <button
          className={
            activeTab === "intents"
              ? "font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }
          onClick={() => setActiveTab("intents")}
        >
          Intents
        </button>
        <button
          className={
            activeTab === "faqs"
              ? "font-semibold"
              : "text-gray-500 hover:text-gray-800"
          }
          onClick={() => setActiveTab("faqs")}
        >
          FAQ
        </button>
      </div>

      {activeTab === "overview" && <BotOverviewTab botId={botId} />}

      {activeTab === "documents" && (
        <DocumentsTab botId={botId} apiBaseUrl={apiBaseUrl} />
      )}

      {activeTab === "intents" && (
        <IntentsTab botId={botId} apiBaseUrl={apiBaseUrl} />
      )}

      {activeTab === "faqs" && <FaqTab botId={botId} apiBaseUrl={apiBaseUrl} />}
    </div>
  );
}

export default function BotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-800 font-medium">Loading bot dashboard...</div>
        </div>
      }
    >
      <InnerBotPage />
    </Suspense>
  );
}

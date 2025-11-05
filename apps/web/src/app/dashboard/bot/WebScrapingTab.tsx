"use client";

import { useState } from "react";

interface WebScrapingTabProps {
  botId: string;
  apiBaseUrl: string;
}

export default function WebScrapingTab({ botId, apiBaseUrl }: WebScrapingTabProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scrapedUrls, setScrapedUrls] = useState<Array<{
    id: string;
    title: string;
    url: string;
    createdAt: string;
  }>>([]);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!response.ok) {
        let errorMessage = `Failed to scrape URL (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
          else if (errorData.message) errorMessage = errorData.message;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccess(`Successfully scraped: ${data.document.title}`);
      setUrl("");

      // Add to scraped URLs list
      setScrapedUrls([
        {
          id: data.document.id,
          title: data.document.title,
          url: url.trim(),
          createdAt: new Date().toISOString(),
        },
        ...scrapedUrls,
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to scrape website");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-16">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Web Scraping</h2>
        <p className="text-sm text-gray-600">
          Add content from websites to your bot's knowledge base. Enter a URL and we'll extract the text content.
        </p>
      </div>

      {/* Scrape Form */}
      <form onSubmit={handleScrape} className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <label htmlFor="url" className="text-sm font-medium text-gray-700">
            Website URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="px-12 py-8 border rounded text-sm text-gray-900 placeholder:text-gray-400"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-600">
            Enter the full URL including https://
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-16 py-8 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Scraping..." : "Scrape Website"}
        </button>

        {error && (
          <div className="px-12 py-8 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="px-12 py-8 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            {success}
          </div>
        )}
      </form>

      {/* Scraped URLs List */}
      {scrapedUrls.length > 0 && (
        <div className="flex flex-col gap-8">
          <h3 className="text-sm font-semibold text-gray-900">Recently Scraped</h3>
          <div className="border rounded divide-y">
            {scrapedUrls.map((item) => (
              <div key={item.id} className="px-12 py-8 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate block"
                    >
                      {item.url}
                    </a>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="px-12 py-8 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
        <p className="font-medium mb-2">How it works:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter a URL of a webpage you want to scrape</li>
          <li>We'll extract the main text content from the page</li>
          <li>The content is saved as a document in your knowledge base</li>
          <li>Your bot can now answer questions about that content</li>
        </ul>
      </div>
    </div>
  );
}

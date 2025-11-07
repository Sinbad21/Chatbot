"use client";

import { useState } from "react";
import { Globe, Eye, Loader2, Check, X, AlertCircle } from "lucide-react";

interface WebScrapingTabProps {
  botId: string;
  apiBaseUrl: string;
}

interface ScrapedLink {
  url: string;
  text: string;
  title?: string;
  snippet?: string;
}

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  content: string;
  contentPreview: string;
}

type ToastType = "success" | "error" | "info";

export default function WebScrapingTab({ botId, apiBaseUrl }: WebScrapingTabProps) {
  const [url, setUrl] = useState("");
  const [isScrapingLinks, setIsScrapingLinks] = useState(false);
  const [isDiscoveringWithSitemap, setIsDiscoveringWithSitemap] = useState(false);
  const [links, setLinks] = useState<ScrapedLink[]>([]);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<LinkPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Retry logic with exponential backoff
  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    maxRetries = 3
  ): Promise<Response> => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // If rate limited, retry with exponential backoff
        if (response.status === 429 || response.status === 403) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            showToast(`Rate limited. Retrying in ${delay / 1000}s...`, "info");
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        return response;
      } catch (err) {
        lastError = err as Error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  };

  const handleScrapeLinks = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      showToast("Please enter a URL", "error");
      return;
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      showToast("Please enter a valid URL (e.g., https://example.com)", "error");
      return;
    }

    setIsScrapingLinks(true);
    setLinks([]);
    setSelectedUrls(new Set());

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetchWithRetry(
        `${apiBaseUrl}/api/v1/scrape`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: url.trim() }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Failed to scrape URL (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setLinks(data.links || []);
      showToast(`Found ${data.totalLinks} links on the page`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to scrape website", "error");
    } finally {
      setIsScrapingLinks(false);
    }
  };

  const handleDiscoverWithSitemap = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      showToast("Please enter a URL", "error");
      return;
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      showToast("Please enter a valid URL (e.g., https://example.com)", "error");
      return;
    }

    setIsDiscoveringWithSitemap(true);
    setLinks([]);
    setSelectedUrls(new Set());

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetchWithRetry(
        `${apiBaseUrl}/api/v1/bots/${botId}/discover-links`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ url: url.trim() }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Failed to discover links (${response.status})`;
        try {
          const errorData = await response.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // Transform the response to match ScrapedLink interface
      const transformedLinks = (data.links || []).map((link: any) => ({
        url: link.url,
        text: link.title || link.url,
        title: link.title,
        snippet: link.snippet,
      }));
      setLinks(transformedLinks);
      showToast(`Found ${data.count} links via sitemap/robots.txt`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to discover links with sitemap", "error");
    } finally {
      setIsDiscoveringWithSitemap(false);
    }
  };

  const handlePreview = async (linkUrl: string) => {
    setPreviewUrl(linkUrl);
    setPreview(null);
    setIsLoadingPreview(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetchWithRetry(
        `${apiBaseUrl}/api/v1/scrape?url=${encodeURIComponent(linkUrl)}`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to preview (${response.status})`);
      }

      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load preview", "error");
      setPreviewUrl(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleToggleSelect = (linkUrl: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(linkUrl)) {
      newSelected.delete(linkUrl);
    } else {
      newSelected.add(linkUrl);
    }
    setSelectedUrls(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUrls.size === links.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(links.map(link => link.url)));
    }
  };

  const handleAddToTraining = async () => {
    if (selectedUrls.size === 0) {
      showToast("Please select at least one link", "error");
      return;
    }

    setIsSaving(true);
    const selectedLinks = links.filter(link => selectedUrls.has(link.url));
    let successCount = 0;
    let failCount = 0;

    try {
      const token = localStorage.getItem("accessToken");

      for (const link of selectedLinks) {
        try {
          // First, get the content preview
          const previewResponse = await fetchWithRetry(
            `${apiBaseUrl}/api/v1/scrape?url=${encodeURIComponent(link.url)}`,
            {
              method: "GET",
              headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
            }
          );

          if (!previewResponse.ok) {
            failCount++;
            continue;
          }

          const previewData = await previewResponse.json();

          // Then save as Document
          const saveResponse = await fetchWithRetry(
            `${apiBaseUrl}/api/v1/bots/${botId}/documents`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                title: previewData.title || link.text || link.url,
                content: previewData.content || previewData.description || "",
                metadata: {
                  sourceUrl: link.url,
                  scrapedAt: new Date().toISOString(),
                },
              }),
            }
          );

          if (saveResponse.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (err) {
          failCount++;
        }
      }

      if (successCount > 0) {
        showToast(
          `Successfully added ${successCount} document${successCount > 1 ? 's' : ''} to training`,
          "success"
        );
        // Clear selection
        setSelectedUrls(new Set());
      }

      if (failCount > 0) {
        showToast(`Failed to add ${failCount} document${failCount > 1 ? 's' : ''}`, "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add documents", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-green-50 border border-green-200 text-green-900"
              : toast.type === "error"
              ? "bg-red-50 border border-red-200 text-red-900"
              : "bg-blue-50 border border-blue-200 text-blue-900"
          }`}
        >
          {toast.type === "success" && <Check size={20} />}
          {toast.type === "error" && <X size={20} />}
          {toast.type === "info" && <AlertCircle size={20} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Web Scraping</h2>
        <p className="text-sm text-gray-600">
          Discover links from a website, preview their content, and add them to your bot's training data.
        </p>
      </div>

      {/* Scrape Form */}
      <form onSubmit={handleScrapeLinks} className="bg-white rounded-lg border p-6">
        <div className="flex flex-col gap-4">
          <label htmlFor="url" className="text-sm font-medium text-gray-700">
            Website URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isScrapingLinks || isDiscoveringWithSitemap}
            />
            <button
              type="submit"
              disabled={isScrapingLinks || isDiscoveringWithSitemap}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isScrapingLinks ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Scraping...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Find Links
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDiscoverWithSitemap}
              disabled={isScrapingLinks || isDiscoveringWithSitemap}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDiscoveringWithSitemap ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Discovering...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Find links with sitemap
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Use "Find Links" to scrape links from a page, or "Find links with sitemap" to discover links via sitemap/robots.txt
          </p>
        </div>
      </form>

      {/* Links Table */}
      {links.length > 0 && (
        <div className="bg-white rounded-lg border">
          {/* Header with Select All and Add to Training */}
          <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUrls.size === links.length && links.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({links.length} links)
                </span>
              </label>
              <span className="text-sm text-gray-500">
                {selectedUrls.size} selected
              </span>
            </div>
            <button
              onClick={handleAddToTraining}
              disabled={selectedUrls.size === 0 || isSaving}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>Add to Training</>
              )}
            </button>
          </div>

          {/* Links List */}
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {links.map((link, index) => (
              <div
                key={`${link.url}-${index}`}
                className="px-6 py-4 hover:bg-gray-50 flex items-start gap-4"
              >
                <input
                  type="checkbox"
                  checked={selectedUrls.has(link.url)}
                  onChange={() => handleToggleSelect(link.url)}
                  className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 break-words">
                    {link.title || link.text || "No title"}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline break-all"
                  >
                    {link.url}
                  </a>
                  {link.snippet && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {link.snippet}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePreview(link.url)}
                  className="flex-shrink-0 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  Preview
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Content Preview</h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-indigo-600" />
                </div>
              ) : preview ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {preview.title}
                    </h4>
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {preview.url}
                    </a>
                  </div>

                  {preview.description && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                      <p className="text-sm text-gray-600">{preview.description}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Content Preview</p>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                      {preview.contentPreview || "No content available"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-600 py-12">
                  Failed to load preview
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setPreviewUrl(null)}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">How it works:</p>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
          <li>Enter a URL to discover all links on that page</li>
          <li>Preview the content of each link before adding</li>
          <li>Select multiple links to add to your bot's training data</li>
          <li>The content is saved as documents in your knowledge base</li>
          <li>Your bot can then answer questions about the content</li>
        </ul>
      </div>
    </div>
  );
}

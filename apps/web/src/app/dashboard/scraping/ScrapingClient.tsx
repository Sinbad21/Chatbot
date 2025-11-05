'use client';

import { useState } from 'react';
import axios from 'axios';

interface ScrapedLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  linkedin?: string;
  source: string;
  score: number;
}

type ToolTab = 'scraper' | 'email-finder' | 'enrichment';

export default function ScrapingClient() {
  const [activeTab, setActiveTab] = useState<ToolTab>('scraper');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapedLead[]>([]);

  // Web Scraper state
  const [targetUrl, setTargetUrl] = useState('');
  const [scrapingDepth, setScrapingDepth] = useState<number>(1);

  // Email Finder state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [domain, setDomain] = useState('');

  // Enrichment state
  const [enrichmentEmail, setEnrichmentEmail] = useState('');

  const handleWebScraping = async () => {
    if (!targetUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/scraping/web`,
        {
          url: targetUrl,
          depth: scrapingDepth,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResults(response.data.leads || []);
    } catch (err: any) {
      console.error('Error scraping website:', err);
      setError(err.response?.data?.error || err.message || 'Failed to scrape website');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailFinder = async () => {
    if (!firstName.trim() || !lastName.trim() || !domain.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/scraping/email-finder`,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          domain: domain.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.email) {
        const lead: ScrapedLead = {
          id: Date.now().toString(),
          name: `${firstName} ${lastName}`,
          email: response.data.email,
          company: domain,
          source: 'Email Finder',
          score: response.data.confidence || 70,
        };
        setResults([lead, ...results]);
      }
    } catch (err: any) {
      console.error('Error finding email:', err);
      setError(err.response?.data?.error || err.message || 'Failed to find email');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrichment = async () => {
    if (!enrichmentEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `${apiUrl}/api/v1/scraping/enrich`,
        {
          email: enrichmentEmail.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const enrichedData = response.data;
      const lead: ScrapedLead = {
        id: Date.now().toString(),
        name: enrichedData.name || 'Unknown',
        email: enrichmentEmail.trim(),
        phone: enrichedData.phone,
        company: enrichedData.company,
        title: enrichedData.title,
        linkedin: enrichedData.linkedin,
        source: 'Enrichment',
        score: enrichedData.score || 60,
      };
      setResults([lead, ...results]);
    } catch (err: any) {
      console.error('Error enriching lead:', err);
      setError(err.response?.data?.error || err.message || 'Failed to enrich lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToLeads = async (lead: ScrapedLead) => {
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        alert('Authentication token not found');
        return;
      }

      await axios.post(
        `${apiUrl}/api/v1/scraping/save-lead`,
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          title: lead.title,
          linkedin: lead.linkedin,
          score: lead.score,
          source: lead.source,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert('Lead saved successfully!');
    } catch (err: any) {
      console.error('Error saving lead:', err);
      alert(err.response?.data?.error || 'Failed to save lead');
    }
  };

  const handleSaveAll = async () => {
    if (results.length === 0) {
      alert('No leads to save');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      if (!token) {
        setError('Authentication token not found');
        return;
      }

      await axios.post(
        `${apiUrl}/api/v1/scraping/save-leads-bulk`,
        {
          leads: results.map(lead => ({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            title: lead.title,
            linkedin: lead.linkedin,
            score: lead.score,
            source: lead.source,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Successfully saved ${results.length} lead(s)!`);
      setResults([]);
    } catch (err: any) {
      console.error('Error saving leads:', err);
      setError(err.response?.data?.error || 'Failed to save leads');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }

    const csvEscape = (v: unknown): string => {
      let s = v == null ? '' : String(v);
      s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const mustQuote = /[",\n]/.test(s);
      if (mustQuote) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    };

    const header = ['Name', 'Email', 'Phone', 'Company', 'Title', 'LinkedIn', 'Score', 'Source'];
    const rows = results.map(lead => [
      lead.name,
      lead.email,
      lead.phone || '',
      lead.company || '',
      lead.title || '',
      lead.linkedin || '',
      lead.score,
      lead.source,
    ]);

    const csvRows = [header, ...rows].map(row => row.map(csvEscape));
    const csvContent = csvRows.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `scraped_leads_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scraping & Lead Generation</h1>
        <p className="text-sm text-gray-600 mt-1">
          Find and collect leads from web sources, discover emails, and enrich contact data
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('scraper')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scraper'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Web Scraper
            </button>
            <button
              onClick={() => setActiveTab('email-finder')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'email-finder'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Email Finder
            </button>
            <button
              onClick={() => setActiveTab('enrichment')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'enrichment'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Lead Enrichment
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Web Scraper Tab */}
          {activeTab === 'scraper' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/team"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a website URL to scrape for contact information
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scraping Depth
                </label>
                <select
                  value={scrapingDepth}
                  onChange={(e) => setScrapingDepth(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={1}>1 level (current page only)</option>
                  <option value={2}>2 levels (current page + linked pages)</option>
                  <option value={3}>3 levels (deep crawl)</option>
                </select>
              </div>

              <button
                onClick={handleWebScraping}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Scraping...' : 'Start Scraping'}
              </button>
            </div>
          )}

          {/* Email Finder Tab */}
          {activeTab === 'email-finder' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Domain
                </label>
                <input
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll find the most likely email format for this person
                </p>
              </div>

              <button
                onClick={handleEmailFinder}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Finding...' : 'Find Email'}
              </button>
            </div>
          )}

          {/* Enrichment Tab */}
          {activeTab === 'enrichment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  value={enrichmentEmail}
                  onChange={(e) => setEnrichmentEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter an email to find additional contact information
                </p>
              </div>

              <button
                onClick={handleEnrichment}
                disabled={loading}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enriching...' : 'Enrich Lead'}
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Results ({results.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
              >
                Export CSV
              </button>
              <button
                onClick={handleSaveAll}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
              >
                Save All to Leads
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{lead.company || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.title || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleSaveToLeads(lead)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No results yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Use the tools above to find and collect leads
          </p>
        </div>
      )}
    </div>
  );
}

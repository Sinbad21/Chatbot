'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number;
  reviewCount: number;
  category: string;
  source: string;
  coordinates: { lat: number; lng: number };
  technologies: string[];
  hasOnlineBooking: boolean;
  socialPresence: {
    facebook: boolean;
    instagram: boolean;
    linkedin: boolean;
  };
}

interface AIAnalysis {
  score: number;
  painPoints: string[];
  opportunity: string;
  approachStrategy: string;
  bestContactTime: string;
  emailHook: string;
  reasoning: string;
}

interface BusinessWithAnalysis extends Business {
  analysis?: AIAnalysis;
  outreachEmail?: {
    subject: string;
    body: string;
    followUpSuggestions: string[];
  };
}

type ViewMode = 'search' | 'results' | 'detail';

export default function ScrapingClient() {
  const [viewMode, setViewMode] = useState<ViewMode>('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search form state
  const [searchGoal, setSearchGoal] = useState('');
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState(10);
  const [businessType, setBusinessType] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [hasWebsite, setHasWebsite] = useState<string>('any');
  const [selectedSources, setSelectedSources] = useState<string[]>(['google_maps', 'yelp']);

  // Results state
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<BusinessWithAnalysis[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessWithAnalysis | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // User product info for AI
  const [userProduct, setUserProduct] = useState('');
  const [userName, setUserName] = useState('');
  const [userCompany, setUserCompany] = useState('');

  useEffect(() => {
    // Load user info from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || '');
        setUserCompany(user.company || '');
      } catch (e) {}
    }
  }, []);

  const handleSearch = async () => {
    if (!searchGoal.trim() || !location.trim()) {
      setError('Please enter both search goal and location');
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
        `${apiUrl}/api/v1/discovery/search`,
        {
          searchGoal: searchGoal.trim(),
          location: location.trim(),
          radius,
          businessType: businessType.trim() || undefined,
          minRating: minRating > 0 ? minRating : undefined,
          maxRating: maxRating < 5 ? maxRating : undefined,
          hasWebsite: hasWebsite !== 'any' ? hasWebsite === 'yes' : undefined,
          sources: selectedSources,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCampaignId(response.data.campaignId);
      setBusinesses(response.data.initialResults || []);
      setViewMode('results');
    } catch (err: any) {
      console.error('Error searching:', err);
      setError(err.response?.data?.error || err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeBusiness = async (business: Business) => {
    try {
      setAnalyzingId(business.id);
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/v1/discovery/analyze`,
        {
          business,
          searchGoal,
          userProduct: userProduct || 'a solution to help businesses grow',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const analysis = response.data.analysis;

      // Update business with analysis
      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? { ...b, analysis } : b))
      );
    } catch (err: any) {
      console.error('Error analyzing business:', err);
      alert(err.response?.data?.error || 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleGenerateEmail = async (business: BusinessWithAnalysis) => {
    if (!business.analysis) {
      alert('Please analyze this business first');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.post(
        `${apiUrl}/api/v1/discovery/generate-outreach`,
        {
          business,
          analysis: business.analysis,
          userInfo: {
            name: userName,
            company: userCompany,
            product: userProduct,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const outreachEmail = response.data;

      // Update business with generated email
      setBusinesses((prev) =>
        prev.map((b) => (b.id === business.id ? { ...b, outreachEmail } : b))
      );

      // Show in detail view
      setSelectedBusiness({ ...business, outreachEmail });
      setViewMode('detail');
    } catch (err: any) {
      console.error('Error generating email:', err);
      alert(err.response?.data?.error || 'Email generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResults = async () => {
    if (!campaignId || businesses.length === 0) {
      alert('No results to save');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_WORKER_API_URL || process.env.NEXT_PUBLIC_API_URL;

      const analyses = businesses.map((b) => b.analysis);

      await axios.post(
        `${apiUrl}/api/v1/discovery/save-results`,
        {
          campaignId,
          businesses,
          analyses,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert(`Successfully saved ${businesses.length} lead(s)!`);
    } catch (err: any) {
      console.error('Error saving results:', err);
      alert(err.response?.data?.error || 'Failed to save results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const handleExportCSV = () => {
    if (businesses.length === 0) {
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

    const header = [
      'Name',
      'Address',
      'Phone',
      'Email',
      'Website',
      'Rating',
      'Reviews',
      'Category',
      'AI Score',
      'Pain Points',
      'Opportunity',
      'Best Contact Time',
    ];

    const rows = businesses.map((b) => [
      b.name,
      b.address,
      b.phone || '',
      b.email || '',
      b.website || '',
      b.rating,
      b.reviewCount,
      b.category,
      b.analysis?.score || '',
      b.analysis?.painPoints?.join('; ') || '',
      b.analysis?.opportunity || '',
      b.analysis?.bestContactTime || '',
    ]);

    const csvRows = [header, ...rows].map((row) => row.map(csvEscape));
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `lead_discovery_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SEARCH VIEW
  if (viewMode === 'search') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Discovery & Generation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Find businesses that need your product using AI-powered multi-source discovery
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Search Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Goal *
            </label>
            <input
              type="text"
              placeholder="e.g., restaurants without online booking system"
              value={searchGoal}
              onChange={(e) => setSearchGoal(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what type of business you want to find and what problem they should have
            </p>
          </div>

          {/* Your Product/Service */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Product/Service
            </label>
            <input
              type="text"
              placeholder="e.g., online booking platform for restaurants"
              value={userProduct}
              onChange={(e) => setUserProduct(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              This helps AI score leads based on fit with your offering
            </p>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                placeholder="e.g., Milan, Italy"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius (km)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value) || 10)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Filters (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <input
                  type="text"
                  placeholder="e.g., restaurant, hotel, retail"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Has Website
                </label>
                <select
                  value={hasWebsite}
                  onChange={(e) => setHasWebsite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="any">Any</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={minRating}
                  onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Rating
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={maxRating}
                  onChange={(e) => setMaxRating(parseFloat(e.target.value) || 5)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Data Sources</h3>
            <div className="flex flex-wrap gap-3">
              {['google_maps', 'yelp', 'facebook', 'yellow_pages'].map((source) => (
                <label key={source} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source]);
                      } else {
                        setSelectedSources(selectedSources.filter((s) => s !== source));
                      }
                    }}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {source.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Start Discovery Search'}
          </button>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  if (viewMode === 'results') {
    const analyzedCount = businesses.filter((b) => b.analysis).length;
    const avgScore =
      analyzedCount > 0
        ? Math.round(
            businesses
              .filter((b) => b.analysis)
              .reduce((sum, b) => sum + (b.analysis?.score || 0), 0) / analyzedCount
          )
        : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Discovery Results</h1>
            <p className="text-sm text-gray-600 mt-1">
              Found {businesses.length} businesses matching your criteria
            </p>
          </div>
          <button
            onClick={() => setViewMode('search')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            New Search
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Found</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{businesses.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Analyzed</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{analyzedCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Avg Score</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{avgScore}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Qualified (70+)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {businesses.filter((b) => (b.analysis?.score || 0) >= 70).length}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Geographic View</h2>
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="mx-auto h-12 w-12 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <p className="text-sm">
                Map integration available in production
                <br />
                <span className="text-xs">(Google Maps API with {businesses.length} pins)</span>
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={handleSaveResults}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
          >
            Save All to Leads
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Business
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    AI Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {businesses.map((business) => (
                  <tr key={business.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{business.name}</div>
                        <div className="text-xs text-gray-600">{business.category}</div>
                        <div className="text-xs text-gray-500">{business.address}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-gray-900">
                        {business.phone && <div>📞 {business.phone}</div>}
                        {business.email && <div>✉️ {business.email}</div>}
                        {business.website && (
                          <div>
                            🌐{' '}
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                        {!business.phone && !business.email && !business.website && (
                          <span className="text-gray-400">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        ⭐ {business.rating.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({business.reviewCount} reviews)
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {business.analysis ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(
                            business.analysis.score
                          )}`}
                        >
                          {business.analysis.score}/100
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Not analyzed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!business.analysis ? (
                          <button
                            onClick={() => handleAnalyzeBusiness(business)}
                            disabled={analyzingId === business.id}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                          >
                            {analyzingId === business.id ? 'Analyzing...' : 'Analyze'}
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setSelectedBusiness(business);
                                setViewMode('detail');
                              }}
                              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleGenerateEmail(business)}
                              className="text-xs text-green-600 hover:text-green-800 font-medium"
                            >
                              Generate Email
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // DETAIL VIEW
  if (viewMode === 'detail' && selectedBusiness) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedBusiness.name}</h1>
            <p className="text-sm text-gray-600 mt-1">{selectedBusiness.category}</p>
          </div>
          <button
            onClick={() => setViewMode('results')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Results
          </button>
        </div>

        {/* Business Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Address:</span>
              <span className="ml-2 text-gray-900">{selectedBusiness.address}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <span className="ml-2 text-gray-900">{selectedBusiness.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-900">{selectedBusiness.email || 'N/A'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Website:</span>
              <span className="ml-2 text-gray-900">
                {selectedBusiness.website ? (
                  <a
                    href={selectedBusiness.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {selectedBusiness.website}
                  </a>
                ) : (
                  'N/A'
                )}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Rating:</span>
              <span className="ml-2 text-gray-900">
                {selectedBusiness.rating.toFixed(1)}/5 ({selectedBusiness.reviewCount} reviews)
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Source:</span>
              <span className="ml-2 text-gray-900">{selectedBusiness.source}</span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        {selectedBusiness.analysis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">AI Analysis</h2>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                  selectedBusiness.analysis.score
                )}`}
              >
                Score: {selectedBusiness.analysis.score}/100
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Why This Lead Is Ideal</h3>
                <p className="text-sm text-gray-900">{selectedBusiness.analysis.opportunity}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pain Points</h3>
                <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                  {selectedBusiness.analysis.painPoints.map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">How to Approach</h3>
                <p className="text-sm text-gray-900">
                  {selectedBusiness.analysis.approachStrategy}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Best Contact Time</h3>
                <p className="text-sm text-gray-900">
                  {selectedBusiness.analysis.bestContactTime}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Email Hook</h3>
                <p className="text-sm text-indigo-600 italic">
                  "{selectedBusiness.analysis.emailHook}"
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Outreach Email */}
        {selectedBusiness.outreachEmail && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Personalized Outreach Email
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                  {selectedBusiness.outreachEmail.subject}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body:</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900 whitespace-pre-wrap">
                  {selectedBusiness.outreachEmail.body}
                </div>
              </div>

              {selectedBusiness.outreachEmail.followUpSuggestions &&
                selectedBusiness.outreachEmail.followUpSuggestions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up Suggestions:
                    </label>
                    <ul className="list-disc list-inside text-sm text-gray-900 space-y-1">
                      {selectedBusiness.outreachEmail.followUpSuggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Subject: ${selectedBusiness.outreachEmail!.subject}\n\n${
                        selectedBusiness.outreachEmail!.body
                      }`
                    );
                    alert('Email copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  Copy Email
                </button>
                <button
                  onClick={() => handleGenerateEmail(selectedBusiness)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        )}

        {!selectedBusiness.outreachEmail && selectedBusiness.analysis && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => handleGenerateEmail(selectedBusiness)}
              disabled={loading}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Personalized Outreach Email'}
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

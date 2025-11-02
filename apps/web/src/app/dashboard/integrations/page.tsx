export default function IntegrationsPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Integrations</h1>
        <p className="text-gray-600 mb-8">
          Connect your chatbot with third-party services and tools
        </p>
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-100 mb-6">
          <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
          </svg>
        </div>
        <p className="text-sm text-gray-500">This feature is coming soon</p>
      </div>
    </div>
  );
}

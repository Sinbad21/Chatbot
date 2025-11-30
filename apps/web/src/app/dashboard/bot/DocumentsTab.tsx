'use client';

import { useState, useEffect } from 'react';
import { buildAuthHeaders } from '@/lib/authHeaders';
import { Upload, FileText, File, X, Eye } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface Document {
  id: string;
  title: string;
  content: string;
  status: string;
  type: string;
  size: number;
  source: 'UPLOAD' | 'SCRAPED';
  excluded: boolean;
  createdAt: string;
}

interface DocumentsTabProps {
  botId: string;
  apiBaseUrl: string;
}

export default function DocumentsTab({ botId, apiBaseUrl }: DocumentsTabProps) {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('file');

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modal state
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [botId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/documents`, {
        headers: buildAuthHeaders(false),
      });

      if (!response.ok) {
        throw new Error(t('bot.documents.failedToLoad'));
      }

      const data = await response.json();
      setDocuments(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown'];
    const allowedExtensions = ['.pdf', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      setError(t('bot.documents.onlyPdfTxtMd'));
      return;
    }

    // Validate file size (25MB)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('bot.documents.fileTooLarge'));
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/documents/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = t('bot.documents.uploadFailed').replace('{status}', response.status.toString());
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.message || errorData.error;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      const result = await response.json();
      await fetchDocuments(); // Refresh the list
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.message || t('bot.documents.uploadFailed').replace('{status}', ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiBaseUrl}/api/v1/bots/${botId}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, url: '', type: 'text' }),
      });

      if (!response.ok) {
        let errorMessage = t('bot.documents.failedToCreate').replace('{status}', response.status.toString());
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {}
        throw new Error(errorMessage);
      }

      await fetchDocuments(); // Refresh the list
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error('Error creating document:', err);
      setError(err.message || t('bot.documents.failedToCreate').replace('{status}', ''));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleExclude = async (documentId: string, currentExcluded: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ excluded: !currentExcluded }),
      });

      if (!response.ok) {
        throw new Error(t('bot.documents.failedToUpdate'));
      }

      // Update local state
      setDocuments(documents.map(doc =>
        doc.id === documentId ? { ...doc, excluded: !currentExcluded } : doc
      ));
    } catch (err: any) {
      console.error('Error toggling exclude:', err);
      setError(err.message);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm(t('bot.documents.confirmDeleteDocument'))) {
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/documents/${documentId}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(false),
      });

      if (!response.ok) {
        throw new Error(t('bot.documents.failedToDelete'));
      }

      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">{t('bot.documents.loadingDocuments')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Document Form */}
      <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-sm border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{t('bot.documents.addNew')}</h3>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setUploadMode('file')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMode === 'file'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <Upload className="inline-block w-4 h-4 mr-2" />
            {t('bot.documents.uploadFile')}
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('text')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              uploadMode === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            <FileText className="inline-block w-4 h-4 mr-2" />
            {t('bot.documents.pasteText')}
          </button>
        </div>

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-white/70 mb-2">
                {t('bot.documents.selectFile')}
              </label>
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.txt,.md"
                onChange={handleFileSelect}
                className="block w-full text-sm text-white border border-white/20 rounded-lg cursor-pointer bg-white/5 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-l-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-700 hover:file:bg-indigo-500/20"
              />
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium text-white">{selectedFile.name}</p>
                    <p className="text-sm text-white/60">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-white/50 hover:text-white/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleFileUpload}
              disabled={!selectedFile || submitting}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? t('bot.documents.uploading') : t('bot.documents.uploadDocument')}
            </button>
          </div>
        )}

        {/* Text Input Mode */}
        {uploadMode === 'text' && (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-1">
                {t('bot.documents.documentTitle')}
                <span className="text-xs text-white/50 ml-2">
                  ({title.length}/200)
                </span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('bot.documents.titlePlaceholder')}
                maxLength={200}
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white bg-white/5"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-white/70 mb-1">
                {t('bot.documents.content')}
                <span className="text-xs text-white/50 ml-2">
                  ({content.length.toLocaleString()}/200,000)
                </span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('bot.documents.contentPlaceholder')}
                rows={8}
                maxLength={200000}
                className="w-full px-4 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-white bg-white/5"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {submitting ? t('bot.documents.adding') : t('bot.documents.addDocument')}
            </button>
          </form>
        )}
      </div>

      {/* Documents List */}
      <div className="bg-black/40 backdrop-blur-md rounded-lg shadow-sm border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {t('bot.documents.documentsCount').replace('{count}', documents.length.toString())}
        </h3>

        {documents.length === 0 ? (
          <p className="text-white/50 text-center py-8">
            {t('bot.documents.noDocuments')}
          </p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`border rounded-lg p-4 transition-colors ${
                  doc.excluded
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/10 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${doc.excluded ? 'text-white/50' : 'text-white'}`}>
                        {doc.title}
                      </h4>
                      {doc.excluded && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                          {t('bot.documents.excluded')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-white/50">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.status === 'COMPLETED'
                          ? 'bg-green-500/20 text-green-700'
                          : doc.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-400'
                      }`}>
                        {doc.status}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                        {doc.type ? doc.type.toUpperCase() : 'UNKNOWN'}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatFileSize(doc.size)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.source === 'UPLOAD'
                          ? 'bg-purple-500/20 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {doc.source}
                      </span>
                    </div>
                  </div>
                </div>
                <p className={`text-sm mb-3 line-clamp-2 ${doc.excluded ? 'text-white/50' : 'text-white/60'}`}>
                  {doc.content}
                </p>
                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setViewingDocument(doc)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {t('bot.documents.viewFullContent')}
                  </button>
                  <button
                    onClick={() => handleToggleExclude(doc.id, doc.excluded)}
                    className={`text-sm font-medium flex items-center gap-1 ${
                      doc.excluded
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-yellow-600 hover:text-yellow-700'
                    }`}
                  >
                    {doc.excluded ? t('bot.documents.includeInTraining') : t('bot.documents.excludeFromTraining')}
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-sm text-red-600 hover:text-red-400 font-medium ml-auto"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Full Content Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-black/40 backdrop-blur-md rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">{viewingDocument.title}</h3>
              <button
                onClick={() => setViewingDocument(null)}
                className="text-white/50 hover:text-white/70"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
                  {viewingDocument.type ? viewingDocument.type.toUpperCase() : 'UNKNOWN'}
                </span>
                <span className="text-xs text-white/50">
                  {formatFileSize(viewingDocument.size)}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  viewingDocument.source === 'UPLOAD'
                    ? 'bg-purple-500/20 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {viewingDocument.source}
                </span>
                <span className="text-xs text-white/50">
                  {new Date(viewingDocument.createdAt).toLocaleDateString()}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-sm text-white/70 font-mono bg-white/5 p-4 rounded-lg">
                {viewingDocument.content}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
              <button
                onClick={() => handleToggleExclude(viewingDocument.id, viewingDocument.excluded)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  viewingDocument.excluded
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {viewingDocument.excluded ? t('bot.documents.includeInTraining') : t('bot.documents.excludeFromTraining')}
              </button>
              <button
                onClick={() => setViewingDocument(null)}
                className="px-4 py-2 bg-gray-200 text-white/70 rounded-lg hover:bg-gray-300 font-medium"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

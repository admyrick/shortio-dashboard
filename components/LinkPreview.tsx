'use client';

import { useState } from 'react';
import { ExternalLink, X, AlertCircle } from 'lucide-react';

interface LinkPreviewProps {
  url: string | null;
  onClose: () => void;
}

export function LinkPreview({ url, onClose }: LinkPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  if (!url) return null;
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Link Preview</h2>
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </a>
          </div>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading preview...</p>
              </div>
            </div>
          )}
          
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center max-w-md">
                <AlertCircle className="w-16 h-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Preview Not Available</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">This website cannot be displayed in a preview. It may have security restrictions (X-Frame-Options) that prevent embedding.</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600">
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
              </div>
            </div>
          ) : (
            <iframe src={url} className="w-full h-full border-0" onLoad={handleIframeLoad} onError={handleIframeError} sandbox="allow-same-origin allow-scripts allow-popups allow-forms" title="Link Preview" />
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            <span className="font-medium">URL:</span> {url}
          </p>
        </div>
      </div>
    </div>
  );
}

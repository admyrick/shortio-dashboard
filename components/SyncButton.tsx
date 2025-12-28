'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function SyncButton({ onSyncComplete }: { onSyncComplete?: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  
  const handleSync = async () => {
    setSyncing(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/sync', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        onSyncComplete?.();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage('Failed to sync');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync from Short.io'}
      </button>
      
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
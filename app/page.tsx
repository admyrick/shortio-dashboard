'use client';

import { SyncButton } from '@/components/SyncButton';
import { LinksTable } from '@/components/LinksTable';
import { useState } from 'react';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Short.io Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and view your shortened links</p>
            </div>
            <SyncButton onSyncComplete={() => setRefreshKey(k => k + 1)} />
          </div>
        </div>
        
        <LinksTable key={refreshKey} />
      </div>
    </main>
  );
}
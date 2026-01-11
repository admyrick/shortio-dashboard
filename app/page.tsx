'use client';

import { SyncButton } from '@/components/SyncButton';
import { LinksTable } from '@/components/LinksTable';
import { ThemeToggle } from '@/components/ThemeToggle';
import { GroupsSidebar } from '@/components/GroupsSidebar';
import { useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('all');
  
  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Short.io Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and view your shortened links</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <SyncButton onSyncComplete={() => setRefreshKey(k => k + 1)} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <GroupsSidebar selectedGroupId={selectedGroup} onSelectGroup={setSelectedGroup} />
          </div>
          
          <div className="lg:col-span-3">
            <LinksTable key={`${refreshKey}-${selectedGroup}`} selectedGroupId={selectedGroup} />
          </div>
        </div>
      </div>
    </main>
  );
}

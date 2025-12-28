'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Copy, TrendingUp, Edit2, Trash2, Download, Eye, RefreshCw } from 'lucide-react';
import { EditLinkModal } from './EditLinkModal';
import { Filters } from './Filters';
import { LinkPreview } from './LinkPreview';

interface Link {
  id: number;
  short_url: string;
  original_url: string;
  path: string;
  title: string;
  domain: string;
  clicks: number;
  created_at: string;
  synced_at: string;
}

export function LinksTable() {
  const [links, setLinks] = useState<Link[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [selectedLinks, setSelectedLinks] = useState<Set<number>>(new Set());
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [countdown, setCountdown] = useState(30);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const limit = 50;
  
  const fetchLinks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: (page * limit).toString(),
        ...(search && { search }),
        ...(filters.domain && { domain: filters.domain }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });
      
      const response = await fetch(`/api/links?${params}`);
      const data = await response.json();
      
      setLinks(data.links);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch links:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/links?action=stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };
  
  const refreshData = () => {
    fetchLinks();
    fetchStats();
    setCountdown(refreshInterval);
  };
  
  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh) {
      // Clear existing intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      // Set up refresh interval
      intervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
      
      // Set up countdown
      setCountdown(refreshInterval);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return refreshInterval;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Clear intervals when auto-refresh is disabled
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefresh, refreshInterval]);
  
  useEffect(() => {
    fetchLinks();
  }, [page, search, filters]);
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLinks(new Set(links.map(link => link.id)));
    } else {
      setSelectedLinks(new Set());
    }
  };
  
  const handleSelectLink = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedLinks);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedLinks(newSelected);
  };
  
  const handleEditSave = async (id: number, data: { title: string; original_url: string }) => {
    try {
      const response = await fetch('/api/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
      });
      
      if (response.ok) {
        refreshData();
      }
    } catch (error) {
      console.error('Failed to update link:', error);
    }
  };
  
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedLinks.size} selected link(s)?`)) return;
    
    try {
      const response = await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedLinks) })
      });
      
      if (response.ok) {
        setSelectedLinks(new Set());
        refreshData();
      }
    } catch (error) {
      console.error('Failed to delete links:', error);
    }
  };
  
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        action: 'export',
        ...(search && { search }),
        ...(filters.domain && { domain: filters.domain }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });
      
      const response = await fetch(`/api/links?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shortio-links-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };
  
  const totalPages = Math.ceil(total / limit);
  const allSelected = links.length > 0 && selectedLinks.size === links.length;
  const someSelected = selectedLinks.size > 0 && selectedLinks.size < links.length;
  
  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Links</p>
                <p className="text-3xl font-bold">{stats.total_links}</p>
              </div>
              <ExternalLink className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold">{stats.total_clicks}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Domains</p>
                <p className="text-3xl font-bold">{stats.total_domains}</p>
              </div>
              <div className="text-right">
                {autoRefresh && (
                  <p className="text-xs text-gray-500">
                    Refreshing in {countdown}s
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Auto-refresh controls */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Auto-refresh stats</span>
            </label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>Every 10s</option>
                <option value={30}>Every 30s</option>
                <option value={60}>Every 1m</option>
                <option value={300}>Every 5m</option>
              </select>
            )}
          </div>
          
          <button
            onClick={refreshData}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Now
          </button>
        </div>
      </div>
      
      <Filters onFilterChange={setFilters} />
      
      <div className="bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search links by title, URL, or path..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {selectedLinks.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-center justify-between">
          <span className="text-blue-800">{selectedLinks.size} link(s) selected</span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(input) => {
                if (input) input.indeterminate = someSelected;
              }}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">Select All</span>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 opacity-0" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title / Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No links found
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedLinks.has(link.id)}
                        onChange={(e) => handleSelectLink(link.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        
                          href={link.short_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-mono text-sm"
                        >
                          {link.short_url}
                        </a>
                        <button
                          onClick={() => copyToClipboard(link.short_url)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {link.title && (
                          <div className="font-medium text-gray-900 mb-1">
                            {link.title}
                          </div>
                        )}
                        <div className="text-gray-500 truncate max-w-md">
                          {link.original_url}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {link.clicks}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewUrl(link.original_url)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Preview link"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingLink(link)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                          href={link.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {page * limit + 1} to {Math.min((page + 1) * limit, total)} of {total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      
      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSave={handleEditSave}
      />
      
      <LinkPreview
        url={previewUrl}
        onClose={() => setPreviewUrl(null)}
      />
    </div>
  );
}

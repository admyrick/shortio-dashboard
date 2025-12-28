'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';

interface FiltersProps {
  onFilterChange: (filters: {
    domain?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    fetchDomains();
  }, []);
  
  const fetchDomains = async () => {
    try {
      const response = await fetch('/api/links?action=domains');
      const data = await response.json();
      setDomains(data);
    } catch (error) {
      console.error('Failed to fetch domains:', error);
    }
  };
  
  const applyFilters = () => {
    onFilterChange({
      domain: selectedDomain || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  };
  
  const clearFilters = () => {
    setSelectedDomain('');
    setStartDate('');
    setEndDate('');
    onFilterChange({});
  };
  
  const hasActiveFilters = selectedDomain || startDate || endDate;
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{[selectedDomain, startDate, endDate].filter(Boolean).length}</span>}
        </button>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>
      
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
            <select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Domains</option>
              {domains.map((domain) => (
                <option key={domain.domain} value={domain.domain}>{domain.domain} ({domain.link_count})</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="md:col-span-3">
            <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}

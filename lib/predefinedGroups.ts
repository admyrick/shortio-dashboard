export interface PredefinedGroup {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  // Filter criteria
  filters: {
    domain?: string[];
    dateRange?: 'today' | 'week' | 'month' | 'year' | 'custom';
    customDateStart?: string;
    customDateEnd?: string;
    minClicks?: number;
    maxClicks?: number;
    hasTitle?: boolean;
    searchKeywords?: string[];
  };
}

// Define your groups here - edit this anytime!
export const PREDEFINED_GROUPS: PredefinedGroup[] = [
  {
    id: 'all',
    name: 'All Links',
    description: 'All your short links',
    color: '#6B7280',
    filters: {}
  },
  {
    id: 'recent',
    name: 'Recent',
    description: 'Links created in the last 7 days',
    color: '#3B82F6',
    filters: {
      dateRange: 'week'
    }
  },
  {
    id: 'popular',
    name: 'Popular',
    description: 'Links with 100+ clicks',
    color: '#10B981',
    filters: {
      minClicks: 100
    }
  },
  {
    id: 'today',
    name: 'Today',
    description: 'Links created today',
    color: '#F59E0B',
    filters: {
      dateRange: 'today'
    }
  },
  {
    id: 'no-clicks',
    name: 'Unused',
    description: 'Links with zero clicks',
    color: '#EF4444',
    filters: {
      maxClicks: 0
    }
  },
  {
    id: 'no-title',
    name: 'Untitled',
    description: 'Links without titles',
    color: '#8B5CF6',
    filters: {
      hasTitle: false
    }
  }
  // Add more groups here as needed!
];

// Helper to calculate date ranges
export function getDateRangeForFilter(dateRange?: string): { startDate?: string; endDate?: string } {
  if (!dateRange) return {};
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (dateRange) {
    case 'today':
      return {
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
      };
    
    case 'week':
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return {
        startDate: weekAgo.toISOString(),
        endDate: now.toISOString()
      };
    
    case 'month':
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      return {
        startDate: monthAgo.toISOString(),
        endDate: now.toISOString()
      };
    
    case 'year':
      const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
      return {
        startDate: yearAgo.toISOString(),
        endDate: now.toISOString()
      };
    
    default:
      return {};
  }
}

// Apply group filters to the query
export function applyGroupFilters(group: PredefinedGroup): Record<string, any> {
  const filters: Record<string, any> = {};
  
  // Apply date range
  if (group.filters.dateRange) {
    const dateRange = getDateRangeForFilter(group.filters.dateRange);
    if (dateRange.startDate) filters.startDate = dateRange.startDate;
    if (dateRange.endDate) filters.endDate = dateRange.endDate;
  }
  
  // Apply custom date range
  if (group.filters.customDateStart) filters.startDate = group.filters.customDateStart;
  if (group.filters.customDateEnd) filters.endDate = group.filters.customDateEnd;
  
  // Apply domain filter
  if (group.filters.domain && group.filters.domain.length > 0) {
    filters.domains = group.filters.domain;
  }
  
  // Click filters
  if (group.filters.minClicks !== undefined) filters.minClicks = group.filters.minClicks;
  if (group.filters.maxClicks !== undefined) filters.maxClicks = group.filters.maxClicks;
  
  // Title filter
  if (group.filters.hasTitle !== undefined) filters.hasTitle = group.filters.hasTitle;
  
  // Search keywords
  if (group.filters.searchKeywords && group.filters.searchKeywords.length > 0) {
    filters.searchKeywords = group.filters.searchKeywords;
  }
  
  return filters;
}

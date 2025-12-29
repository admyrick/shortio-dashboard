'use client';

import { Folder } from 'lucide-react';
import { PREDEFINED_GROUPS, PredefinedGroup } from '@/lib/predefinedGroups';

interface GroupsSidebarProps {
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
}

export function GroupsSidebar({ selectedGroupId, onSelectGroup }: GroupsSidebarProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg dark:shadow-gray-900/50 transition-colors">
      <div className="flex items-center gap-2 mb-4">
        <Folder className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Filters</h3>
      </div>
      
      <div className="space-y-1">
        {PREDEFINED_GROUPS.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
              selectedGroupId === group.id
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: group.color }}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{group.name}</div>
              {group.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {group.description}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          These filters are predefined and available to everyone
        </p>
      </div>
    </div>
  );
}

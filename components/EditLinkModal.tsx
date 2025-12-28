'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EditLinkModalProps {
  link: {
    id: number;
    title: string;
    original_url: string;
    short_url: string;
  } | null;
  onClose: () => void;
  onSave: (id: number, data: { title: string; original_url: string }) => void;
}

export function EditLinkModal({ link, onClose, onSave }: EditLinkModalProps) {
  const [title, setTitle] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    if (link) {
      setTitle(link.title || '');
      setOriginalUrl(link.original_url || '');
    }
  }, [link]);
  
  if (!link) return null;
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(link.id, { title, original_url: originalUrl });
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Link</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Short URL (Read-only)</label>
            <input type="text" value={link.short_url} readOnly className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter link title" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Original URL</label>
            <input type="url" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}

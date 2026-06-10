'use client';

import { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';

interface Layout {
  id: string;
  name: string;
  description: string | null;
  layout_type: string;
  is_active: boolean;
  sort_order: number;
  supports_backsplash: boolean;
  supports_sink: boolean;
  supports_wall_toggle: boolean;
}

export default function AdminLayoutsPage() {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      const res = await fetch('/api/admin/layouts');
      if (!res.ok) throw new Error('Failed to load layouts');
      setLayouts(await res.json());
    } catch {
      setError('Failed to load layouts');
    } finally {
      setLoading(false);
    }
  };

  const toggleLayout = async (layout: Layout) => {
    setTogglingId(layout.id);
    setError(null);

    try {
      const res = await fetch(`/api/admin/layouts/${layout.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !layout.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update layout');

      setLayouts((prev) =>
        prev.map((l) => (l.id === layout.id ? { ...l, is_active: !l.is_active } : l))
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminShell title="Layouts">
      <p className="text-gray-600 text-sm mb-6">
        Enable or disable layouts for the customer flow. Layout configuration (fields, images, measurements) is managed separately.
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Features</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sort</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {layouts.map((layout) => (
                <tr key={layout.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-800 font-medium">{layout.name}</div>
                    {layout.description && (
                      <div className="text-xs text-gray-500 mt-0.5">{layout.description}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{layout.layout_type}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {layout.supports_backsplash && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Backsplash</span>
                      )}
                      {layout.supports_sink && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Sink</span>
                      )}
                      {layout.supports_wall_toggle && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">Wall Toggle</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{layout.sort_order}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => toggleLayout(layout)}
                      disabled={togglingId === layout.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        layout.is_active ? 'bg-green-500' : 'bg-gray-300'
                      } ${togglingId === layout.id ? 'opacity-50' : ''}`}
                      aria-label={`${layout.is_active ? 'Disable' : 'Enable'} ${layout.name}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          layout.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

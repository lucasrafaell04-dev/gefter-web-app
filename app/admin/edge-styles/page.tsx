'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminModal from '@/components/admin/AdminModal';

interface EdgeStyle {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  price_per_linear_ft: number;
  thickness: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY_FORM = {
  name: '',
  description: '',
  image: '',
  price_per_linear_ft: '',
  thickness: '',
  is_active: true,
  sort_order: '0',
};

export default function AdminEdgeStylesPage() {
  const [edgeStyles, setEdgeStyles] = useState<EdgeStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEdgeStyles();
  }, []);

  const loadEdgeStyles = async () => {
    try {
      const res = await fetch('/api/admin/edge-styles');
      if (!res.ok) throw new Error('Failed to load edge styles');
      setEdgeStyles(await res.json());
    } catch {
      setError('Failed to load edge styles');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (edge: EdgeStyle) => {
    setEditingId(edge.id);
    setForm({
      name: edge.name,
      description: edge.description || '',
      image: edge.image || '',
      price_per_linear_ft: String(edge.price_per_linear_ft),
      thickness: edge.thickness,
      is_active: edge.is_active,
      sort_order: String(edge.sort_order),
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/edge-styles/${editingId}` : '/api/admin/edge-styles';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          sort_order: parseInt(form.sort_order) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setModalOpen(false);
      await loadEdgeStyles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete edge style "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/edge-styles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await loadEdgeStyles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <AdminShell title="Edge Styles">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 text-sm">{edgeStyles.length} edge style(s)</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Edge Style
        </button>
      </div>

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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thickness</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price/linear ft</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sort</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {edgeStyles.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{e.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{e.thickness}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">${e.price_per_linear_ft}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{e.sort_order}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${e.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {e.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(e)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(e.id, e.name)} className="p-2 hover:bg-red-50 rounded-lg text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <AdminModal title={editingId ? 'Edit Edge Style' : 'Add Edge Style'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thickness *</label>
                <input className={inputClass} value={form.thickness} onChange={(e) => setForm({ ...form, thickness: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per linear ft *</label>
                <input type="number" step="0.01" className={inputClass} value={form.price_per_linear_ft} onChange={(e) => setForm({ ...form, price_per_linear_ft: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" className={inputClass} value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              Active (visible to customers)
            </label>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </AdminShell>
  );
}

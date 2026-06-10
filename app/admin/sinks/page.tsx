'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminModal from '@/components/admin/AdminModal';

interface Sink {
  id: string;
  name: string | null;
  price: number | null;
  environment: string | null;
  asset_url: string | null;
}

const EMPTY_FORM = {
  name: '',
  price: '',
  environment: 'kitchen',
  asset_url: '',
};

export default function AdminSinksPage() {
  const [sinks, setSinks] = useState<Sink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSinks();
  }, []);

  const loadSinks = async () => {
    try {
      const res = await fetch('/api/admin/sinks');
      if (!res.ok) throw new Error('Failed to load sinks');
      setSinks(await res.json());
    } catch {
      setError('Failed to load sinks');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (sink: Sink) => {
    setEditingId(sink.id);
    setForm({
      name: sink.name || '',
      price: sink.price != null ? String(sink.price) : '',
      environment: sink.environment || 'kitchen',
      asset_url: sink.asset_url || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/sinks/${editingId}` : '/api/admin/sinks';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');

      setModalOpen(false);
      await loadSinks();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete sink "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/sinks/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await loadSinks();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <AdminShell title="Sinks">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 text-sm">{sinks.length} sink(s)</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Sink
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Environment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sinks.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{s.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 capitalize">{s.environment || 'kitchen'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {s.price != null && s.price > 0 ? `$${s.price}` : 'Included'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name || 'sink')} className="p-2 hover:bg-red-50 rounded-lg text-red-600">
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
        <AdminModal title={editingId ? 'Edit Sink' : 'Add Sink'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (0 = included)</label>
                <input type="number" step="0.01" className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
                <select
                  className={inputClass}
                  value={form.environment}
                  onChange={(e) => setForm({ ...form, environment: e.target.value })}
                >
                  <option value="kitchen">Kitchen</option>
                  <option value="bathroom">Bathroom</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Asset URL</label>
              <input className={inputClass} value={form.asset_url} onChange={(e) => setForm({ ...form, asset_url: e.target.value })} />
            </div>
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

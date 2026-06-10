'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import AdminModal from '@/components/admin/AdminModal';

interface Material {
  id: string;
  name: string;
  brand: string;
  color: string;
  variation: string;
  thickness: number;
  price_per_sqft: number;
  image: string | null;
  desc_Curta: string | null;
  desc_Longa: string | null;
  Surface: string | null;
  Finish: string | null;
  Care: string | null;
  Warranty: string | null;
}

const EMPTY_FORM = {
  name: '',
  brand: '',
  color: '',
  variation: 'Standard',
  thickness: '',
  price_per_sqft: '',
  image: '',
  desc_Curta: '',
  desc_Longa: '',
  Surface: '',
  Finish: '',
  Care: '',
  Warranty: '',
};

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      const res = await fetch('/api/admin/materials');
      if (!res.ok) throw new Error('Failed to load materials');
      setMaterials(await res.json());
    } catch {
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (material: Material) => {
    setEditingId(material.id);
    setForm({
      name: material.name,
      brand: material.brand,
      color: material.color,
      variation: material.variation,
      thickness: String(material.thickness),
      price_per_sqft: String(material.price_per_sqft),
      image: material.image || '',
      desc_Curta: material.desc_Curta || '',
      desc_Longa: material.desc_Longa || '',
      Surface: material.Surface || '',
      Finish: material.Finish || '',
      Care: material.Care || '',
      Warranty: material.Warranty || '',
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/materials/${editingId}` : '/api/admin/materials';
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
      await loadMaterials();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete material "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      await loadMaterials();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <AdminShell title="Materials">
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600 text-sm">{materials.length} material(s)</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Material
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Brand</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Color</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thickness</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price/sq ft</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{m.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{m.brand}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{m.color}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{m.thickness}&quot;</td>
                  <td className="py-3 px-4 text-sm text-gray-600">${m.price_per_sqft}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(m)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id, m.name)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
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
        <AdminModal
          title={editingId ? 'Edit Material' : 'Add Material'}
          onClose={() => setModalOpen(false)}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                <input className={inputClass} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input className={inputClass} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variation</label>
                <input className={inputClass} value={form.variation} onChange={(e) => setForm({ ...form, variation: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thickness (in) *</label>
                <input type="number" step="0.1" className={inputClass} value={form.thickness} onChange={(e) => setForm({ ...form, thickness: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per sq ft *</label>
                <input type="number" step="0.01" className={inputClass} value={form.price_per_sqft} onChange={(e) => setForm({ ...form, price_per_sqft: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input className={inputClass} value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea className={inputClass} rows={2} value={form.desc_Curta} onChange={(e) => setForm({ ...form, desc_Curta: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Long Description</label>
              <textarea className={inputClass} rows={3} value={form.desc_Longa} onChange={(e) => setForm({ ...form, desc_Longa: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface</label>
                <input className={inputClass} value={form.Surface} onChange={(e) => setForm({ ...form, Surface: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Finish</label>
                <input className={inputClass} value={form.Finish} onChange={(e) => setForm({ ...form, Finish: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Care</label>
                <input className={inputClass} value={form.Care} onChange={(e) => setForm({ ...form, Care: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                <input className={inputClass} value={form.Warranty} onChange={(e) => setForm({ ...form, Warranty: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
    </AdminShell>
  );
}

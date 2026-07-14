import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Star, Info } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const EMPTY_TESTIMONIAL = { name: '', role: '', company: '', rating: 5, text: '' };

function TestimonialFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_TESTIMONIAL);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, rating: Number(form.rating) };
      if (isEdit) {
        await apiClient.put(`/testimonials/${initial.id}`, payload);
      } else {
        await apiClient.post('/testimonials', payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Testimonial' : 'New Testimonial'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Name</label>
            <input required className="field-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Rating (1–5)</label>
            <input required type="number" min="1" max="5" className="field-input" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Role</label>
            <input required className="field-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Network Engineer" />
          </div>
          <div>
            <label className="field-label">Company</label>
            <input required className="field-input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Testimonial Text</label>
          <textarea required className="field-textarea" value={form.text} onChange={e => setForm({ ...form, text: e.target.value })} />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiClient.get('/testimonials').then(res => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (item) => {
    await apiClient.delete(`/testimonials/${item.id}`);
    load();
  };

  if (loading) return <PageLoader label="Loading testimonials…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Testimonials</h1>
          <p className="text-slate-500 text-sm mt-1">Shown on the homepage "Student Success" section.</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Testimonial</span>
        </button>
      </div>

      {items.some(i => String(i.id).startsWith('default-')) && (
        <div className="flex items-start space-x-2.5 text-sm text-amber-300 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Showing built-in placeholder testimonials</p>
            <p className="text-amber-300/70 text-xs mt-1">
              These are display-only fallbacks shown because none exist in the database yet — that's why Edit and
              Delete are grayed out below. Click "New Testimonial" to add your first real one; once at least one
              exists, these placeholders disappear and every row becomes fully editable.
            </p>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState icon={Star} title="No testimonials yet" description="Add a student success story to build trust on the homepage." />
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'role', label: 'Role' },
            { key: 'company', label: 'Company' },
            { key: 'rating', label: 'Rating', render: (t) => '★'.repeat(t.rating) },
            { key: 'text', label: 'Text', render: (t) => <span className="text-slate-400 text-xs line-clamp-2 block max-w-xs">{t.text}</span> },
          ]}
          rows={items}
          actions={(item) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setModal(item)} disabled={String(item.id).startsWith('default-')} className="btn-ghost px-2! py-1.5! disabled:opacity-30"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(item)} disabled={String(item.id).startsWith('default-')} className="btn-ghost px-2! py-1.5! text-red-400! disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <TestimonialFormModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          description={`Delete the testimonial from "${deleteTarget.name}"?`}
          onConfirm={() => remove(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default Testimonials;
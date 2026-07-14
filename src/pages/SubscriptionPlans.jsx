import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, CreditCard, Info } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Toggle from '../components/ui/Toggle';

const EMPTY_PLAN = { name: '', planType: 'monthly', price: 0, billingPeriod: 'month', description: '', features: '', badge: '', cta: 'Upgrade Now', featured: false };

function PlanFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial ? { ...initial, features: (initial.features || []).join('\n') } : EMPTY_PLAN
  );
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        features: form.features.split('\n').map(f => f.trim()).filter(Boolean),
        badge: form.badge || null,
      };
      if (isEdit) {
        await apiClient.put(`/subscriptions/${initial.id}`, payload);
      } else {
        await apiClient.post('/subscriptions', payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Plan' : 'New Subscription Plan'} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Plan Name</label>
            <input required className="field-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Premium Monthly" />
          </div>
          <div>
            <label className="field-label">Plan Type</label>
            <select className="field-select" value={form.planType} onChange={e => setForm({ ...form, planType: e.target.value })}>
              <option value="free">free</option>
              <option value="monthly">monthly</option>
              <option value="yearly">yearly</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Price (USD)</label>
            <input required type="number" min="0" step="0.01" className="field-input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Billing Period</label>
            <select className="field-select" value={form.billingPeriod} onChange={e => setForm({ ...form, billingPeriod: e.target.value })}>
              <option value="forever">forever</option>
              <option value="month">month</option>
              <option value="year">year</option>
            </select>
          </div>
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea required className="field-textarea" style={{ minHeight: 60 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Features (one per line)</label>
          <textarea required className="field-textarea" value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} placeholder={'Unlimited practice exams\nDownload lab PDFs\nPriority support'} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Badge (optional)</label>
            <input className="field-input" value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Most Popular" />
          </div>
          <div>
            <label className="field-label">Button Text</label>
            <input required className="field-input" value={form.cta} onChange={e => setForm({ ...form, cta: e.target.value })} />
          </div>
        </div>
        <Toggle label="Featured (highlighted plan)" checked={!!form.featured} onChange={v => setForm({ ...form, featured: v })} />
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Plan'}</button>
        </div>
      </form>
    </Modal>
  );
}

function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiClient.get('/subscriptions').then(res => setPlans(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (plan) => {
    await apiClient.delete(`/subscriptions/${plan.id}`);
    load();
  };

  if (loading) return <PageLoader label="Loading plans…" />;

  const usingDefaults = plans.some(p => String(p.id).startsWith('default-'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Subscription Plans</h1>
          <p className="text-slate-500 text-sm mt-1">Shown on the public Pricing page.</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Plan</span>
        </button>
      </div>

      {usingDefaults && (
        <div className="flex items-start space-x-2.5 text-sm text-amber-300 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Showing built-in placeholder plans</p>
            <p className="text-amber-300/70 text-xs mt-1">
              These are display-only fallbacks shown because no real plans exist in the database yet — that's why
              Edit and Delete are grayed out below. Click "New Plan" to create your first real plan; once at least
              one exists, these placeholders disappear and every plan becomes fully editable.
            </p>
          </div>
        </div>
      )}

      {plans.length === 0 ? (
        <EmptyState icon={CreditCard} title="No plans yet" description="Create your Free, Monthly and Yearly plans." />
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price', render: (p) => `$${p.price} / ${p.billingPeriod}` },
            { key: 'featured', label: 'Featured', render: (p) => p.featured ? <span className="badge badge-blue">Featured</span> : '—' },
            { key: 'features', label: 'Features', render: (p) => `${(p.features || []).length} listed` },
          ]}
          rows={plans}
          actions={(plan) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setModal(plan)} disabled={String(plan.id).startsWith('default-')} className="btn-ghost px-2! py-1.5! disabled:opacity-30"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(plan)} disabled={String(plan.id).startsWith('default-')} className="btn-ghost px-2! py-1.5! text-red-400! disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <PlanFormModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          description={`Delete the "${deleteTarget.name}" plan?`}
          onConfirm={() => remove(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default SubscriptionPlans;
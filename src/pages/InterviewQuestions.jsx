import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MessageCircleQuestion } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const EMPTY_Q = { topic: '', questionText: '', correctAnswer: '' };

function QuestionFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_Q);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.put(`/interviews/${initial.id}`, form);
      } else {
        await apiClient.post('/interviews', form);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Question' : 'New Interview Question'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Topic</label>
          <input required className="field-input" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} placeholder="CCNA, Subnetting, Career…" />
        </div>
        <div>
          <label className="field-label">Question</label>
          <textarea required className="field-textarea" value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Correct / Model Answer</label>
          <textarea required className="field-textarea" value={form.correctAnswer} onChange={e => setForm({ ...form, correctAnswer: e.target.value })} />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}

function InterviewQuestions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiClient.get('/interviews').then(res => setItems(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (item) => {
    await apiClient.delete(`/interviews/${item.id}`);
    load();
  };

  if (loading) return <PageLoader label="Loading interview questions…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Interview Questions</h1>
          <p className="text-slate-500 text-sm mt-1">{items.length} question{items.length !== 1 ? 's' : ''} across all topics.</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Question</span>
        </button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={MessageCircleQuestion} title="No interview questions yet" description="Add topic-based Q&A to help students prep for interviews." />
      ) : (
        <DataTable
          columns={[
            { key: 'topic', label: 'Topic', render: (q) => <span className="badge badge-orange">{q.topic}</span> },
            { key: 'questionText', label: 'Question', render: (q) => <span className="text-slate-300 text-xs line-clamp-2 block max-w-sm">{q.questionText}</span> },
          ]}
          rows={items}
          actions={(item) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setModal(item)} className="btn-ghost !px-2 !py-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(item)} className="btn-ghost !px-2 !py-1.5 !text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <QuestionFormModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          description="Delete this interview question?"
          onConfirm={() => remove(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default InterviewQuestions;

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, ClipboardList, Info, CheckCircle2 } from 'lucide-react';
import apiClient, { AUTH_STORAGE_KEY } from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const EMPTY_Q = { category: '', questionText: '', options: '', correctOption: '', explanation: '', indexNumber: '' };

// initial: null for "create new", or an existing question object for "edit".
function QuestionFormModal({ initial, nextIndex, onClose, onSaved }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(
    isEdit
      ? { ...initial, options: (initial.options || []).join('\n') }
      : { ...EMPTY_Q, indexNumber: nextIndex }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');


  const parsedOptions = useMemo(
    () => form.options.split('\n').map(o => o.trim()).filter(Boolean),
    [form.options]
  );
  const parsedOptionsKey = parsedOptions.join('\n');

  useEffect(() => {
    setForm(f => (f.correctOption && !parsedOptions.includes(f.correctOption) ? { ...f, correctOption: '' } : f));
  }, [parsedOptionsKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.correctOption || !parsedOptions.includes(form.correctOption)) {
      setError('Select which option is correct — it must be one of the options typed above.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        category: form.category,
        questionText: form.questionText,
        correctOption: form.correctOption,
        explanation: form.explanation,
        indexNumber: Number(form.indexNumber),
        options: parsedOptions,
      };
      if (isEdit) {
        await apiClient.put(`/exams/questions/${initial.id}`, payload);
      } else {
        await apiClient.post('/exams/questions', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || `Could not ${isEdit ? 'update' : 'create'} question.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Practice Question' : 'New Practice Question'} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl">{error}</div>}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Category</label>
            <input required className="field-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="CCNA, CCNP, Cybersecurity…" />
          </div>
          <div>
            <label className="field-label">Index Number (unique, free if ≤ 40)</label>
            <input required type="number" min="1" className="field-input" value={form.indexNumber} onChange={e => setForm({ ...form, indexNumber: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Question Text</label>
          <textarea required className="field-textarea" style={{ minHeight: 60 }} value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Options (one per line)</label>
          <textarea required className="field-textarea" value={form.options} onChange={e => setForm({ ...form, options: e.target.value })} placeholder={'router ospf 1\nospf enable 1\nip ospf process 1'} />
        </div>
        <div>
          <label className="field-label">Correct Option</label>
          {parsedOptions.length === 0 ? (
            <p className="text-xs text-slate-600 italic px-1">Type the options above first, then pick the correct one here.</p>
          ) : (
            <div className="space-y-2">
              {parsedOptions.map((opt, i) => (
                <label
                  key={`${i}-${opt}`}
                  className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border text-sm cursor-pointer transition ${
                    form.correctOption === opt
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/8 bg-white/3 text-slate-300 hover:border-white/20'
                  }`}
                >
                  <input
                    type="radio"
                    name="correctOption"
                    className="accent-emerald-500 shrink-0"
                    checked={form.correctOption === opt}
                    onChange={() => setForm({ ...form, correctOption: opt })}
                  />
                  <span className="flex-1">{opt}</span>
                  {form.correctOption === opt && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                </label>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="field-label">Explanation</label>
          <textarea required className="field-textarea" style={{ minHeight: 60 }} value={form.explanation} onChange={e => setForm({ ...form, explanation: e.target.value })} />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Question'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ExamQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | question object
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    let token = null;
    try {
      token = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null')?.token;
    } catch { /* ignore */ }
    apiClient.get('/exams/questions', { params: token ? { user_token: token } : {} })
      .then(res => setQuestions(res.data.sort((a, b) => a.indexNumber - b.indexNumber)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const deleteQuestion = async (question) => {
    await apiClient.delete(`/exams/questions/${question.id}`);
    load();
  };

  if (loading) return <PageLoader label="Loading exam questions…" />;

  const nextIndex = questions.length ? Math.max(...questions.map(q => q.indexNumber)) + 1 : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Practice Exam Questions</h1>
          <p className="text-slate-500 text-sm mt-1">{questions.length} question{questions.length !== 1 ? 's' : ''} · index ≤ 40 is free, above that requires Premium.</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>Add Question</span>
        </button>
      </div>

      <div className="flex items-start space-x-2.5 text-xs text-slate-500 glass-card-static rounded-xl p-3.5">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <span>Index number controls both ordering and tier — 1–40 is free, anything above requires Premium. Changing a question's index to one that's already taken is blocked automatically.</span>
      </div>

      {questions.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No practice questions yet" description="Add your first question to power the Practice Exam page." />
      ) : (
        <DataTable
          columns={[
            { key: 'indexNumber', label: '#' },
            { key: 'category', label: 'Category', render: (q) => <span className="badge badge-blue">{q.category}</span> },
            { key: 'questionText', label: 'Question', render: (q) => <span className="text-slate-300 text-xs line-clamp-2 block max-w-sm">{q.questionText}</span> },
            { key: 'tier', label: 'Tier', render: (q) => q.indexNumber <= 40 ? <span className="badge badge-green">Free</span> : <span className="badge badge-purple">Premium</span> },
          ]}
          rows={questions}
          actions={(question) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setModal(question)} className="btn-ghost px-2! py-1.5!"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(question)} className="btn-ghost px-2! py-1.5! text-red-400!"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <QuestionFormModal
          initial={modal === 'new' ? null : modal}
          nextIndex={nextIndex}
          onClose={() => setModal(null)}
          onSaved={load}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          description={`Delete question #${deleteTarget.indexNumber}? This can't be undone.`}
          onConfirm={() => deleteQuestion(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default ExamQuestions;
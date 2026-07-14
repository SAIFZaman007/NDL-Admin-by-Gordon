import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Info } from 'lucide-react';
import apiClient from '../api/client';
import PageLoader from '../components/ui/PageLoader';

const ICONS = ['Award', 'Users', 'Target', 'BookOpen'];

function AboutContent() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    apiClient.get('/about')
      .then(res => setForm({
        title: res.data.title,
        subTitle: res.data.subTitle,
        paragraphs: res.data.paragraphs || [],
        stats: res.data.stats || [],
      }))
      .finally(() => setLoading(false));
  }, []);

  const updateParagraph = (idx, value) => {
    setForm(f => ({ ...f, paragraphs: f.paragraphs.map((p, i) => i === idx ? value : p) }));
  };
  const addParagraph = () => setForm(f => ({ ...f, paragraphs: [...f.paragraphs, ''] }));
  const removeParagraph = (idx) => setForm(f => ({ ...f, paragraphs: f.paragraphs.filter((_, i) => i !== idx) }));

  const updateStat = (idx, key, value) => {
    setForm(f => ({ ...f, stats: f.stats.map((s, i) => i === idx ? { ...s, [key]: value } : s) }));
  };
  const addStat = () => setForm(f => ({ ...f, stats: [...f.stats, { icon: 'Award', label: '', sub: '' }] }));
  const removeStat = (idx) => setForm(f => ({ ...f, stats: f.stats.filter((_, i) => i !== idx) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/about', form);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <PageLoader label="Loading About page content…" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-white">About Page Content</h1>
        <p className="text-slate-500 text-sm mt-1">Edits the single About page shown on the public site.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="glass-card-static rounded-2xl p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label">Page Title</label>
              <input required className="field-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Badge / Subtitle</label>
              <input required className="field-input" value={form.subTitle} onChange={e => setForm({ ...form, subTitle: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="glass-card-static rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="field-label !mb-0">Paragraphs</label>
            <button type="button" onClick={addParagraph} className="btn-ghost text-xs flex items-center space-x-1"><Plus className="h-3 w-3" /><span>Add paragraph</span></button>
          </div>
          {form.paragraphs.map((p, idx) => (
            <div key={idx} className="flex items-start space-x-2">
              <textarea className="field-textarea flex-1" style={{ minHeight: 70 }} value={p} onChange={e => updateParagraph(idx, e.target.value)} />
              <button type="button" onClick={() => removeParagraph(idx)} className="btn-ghost !px-2 !py-1.5 !text-red-400 flex-shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="glass-card-static rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="field-label !mb-0">Stat Highlights</label>
            <button type="button" onClick={addStat} className="btn-ghost text-xs flex items-center space-x-1"><Plus className="h-3 w-3" /><span>Add stat</span></button>
          </div>
          {form.stats.map((s, idx) => (
            <div key={idx} className="grid sm:grid-cols-[100px_1fr_1fr_auto] gap-2 items-start">
              <select className="field-select" value={s.icon} onChange={e => updateStat(idx, 'icon', e.target.value)}>
                {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <input className="field-input" placeholder="Label" value={s.label} onChange={e => updateStat(idx, 'label', e.target.value)} />
              <input className="field-input" placeholder="Sub-text" value={s.sub} onChange={e => updateStat(idx, 'sub', e.target.value)} />
              <button type="button" onClick={() => removeStat(idx)} className="btn-ghost !px-2 !py-1.5 !text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center space-x-1.5">
            <Save className="h-3.5 w-3.5" /><span>{saving ? 'Saving…' : 'Save Changes'}</span>
          </button>
          {savedAt && (
            <span className="text-xs text-emerald-400 flex items-center space-x-1"><Info className="h-3 w-3" /><span>Saved at {savedAt.toLocaleTimeString()}</span></span>
          )}
        </div>
      </form>
    </div>
  );
}

export default AboutContent;

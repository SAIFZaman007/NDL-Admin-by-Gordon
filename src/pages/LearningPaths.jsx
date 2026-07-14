import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Layers, ArrowLeft, BookOpen } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const PATH_TYPES = [
  { value: 'TOPIC', label: 'By Topic' },
  { value: 'CAREER_TRACK', label: 'By Career Track' },
];
const EMPTY_PATH = { title: '', description: '', pathType: 'TOPIC', iconUrl: '' };

function PathFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial ? { ...EMPTY_PATH, ...initial } : EMPTY_PATH);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        pathType: form.pathType,
        iconUrl: form.iconUrl || null,
      };
      if (isEdit) {
        await apiClient.put(`/learning-paths/${initial.id}`, payload);
      } else {
        await apiClient.post('/learning-paths', payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Learning Path' : 'New Learning Path'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Network Engineer" />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="field-textarea" style={{ minHeight: 60 }} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="One or two sentences shown under the title" />
        </div>
        <div>
          <label className="field-label">Type</label>
          <select className="field-select" value={form.pathType} onChange={e => setForm({ ...form, pathType: e.target.value })}>
            {PATH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Path'}</button>
        </div>
      </form>
    </Modal>
  );
}

function AddCourseModal({ path, allCourses, onClose, onSaved }) {
  const attachedIds = new Set((path.courses || []).map(c => c.courseId));
  const availableCourses = allCourses.filter(c => !attachedIds.has(c.id));
  const [courseId, setCourseId] = useState(availableCourses[0]?.id || '');
  const [orderIndex, setOrderIndex] = useState((path.courses?.length || 0) + 1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!courseId) { setError('Pick a course to add.'); return; }
    setSaving(true);
    try {
      await apiClient.post(`/learning-paths/${path.id}/courses`, { courseId, orderIndex: Number(orderIndex) });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add course.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Add Course to "${path.title}"`} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-2.5 rounded-xl">{error}</div>}
        {availableCourses.length === 0 ? (
          <p className="text-sm text-slate-500">Every existing course is already in this path.</p>
        ) : (
          <>
            <div>
              <label className="field-label">Course</label>
              <select className="field-select" value={courseId} onChange={e => setCourseId(e.target.value)}>
                {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Order Index</label>
              <input required type="number" min="1" className="field-input" value={orderIndex} onChange={e => setOrderIndex(e.target.value)} />
            </div>
          </>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving || availableCourses.length === 0} className="btn-primary text-sm">{saving ? 'Adding…' : 'Add Course'}</button>
        </div>
      </form>
    </Modal>
  );
}

function LearningPaths() {
  const [paths, setPaths] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState(null);

  const [pathModal, setPathModal] = useState(null); // null | 'new' | path object
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'path'|'course', item, path? }

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      apiClient.get('/learning-paths'),
      apiClient.get('/courses'),
    ]).then(([pathsRes, coursesRes]) => {
      setPaths(pathsRes.data);
      setAllCourses(coursesRes.data);
      setSelectedPath(prev => prev ? (pathsRes.data.find(p => p.id === prev.id) || null) : prev);
    }).finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const deletePath = async (path) => {
    await apiClient.delete(`/learning-paths/${path.id}`);
    if (selectedPath?.id === path.id) setSelectedPath(null);
    loadAll();
  };

  const removeCourseFromPath = async (path, courseEntry) => {
    await apiClient.delete(`/learning-paths/${path.id}/courses/${courseEntry.courseId}`);
    loadAll();
  };

  if (loading) return <PageLoader label="Loading learning paths…" />;

  // --- Course management view for a single path ---
  if (selectedPath) {
    const courseEntries = [...(selectedPath.courses || [])].sort((a, b) => a.orderIndex - b.orderIndex);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedPath(null)} className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="h-3.5 w-3.5" /><span>All Learning Paths</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">{selectedPath.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{courseEntries.length} course{courseEntries.length !== 1 ? 's' : ''} in this path</p>
          </div>
          <button onClick={() => setAddCourseModal(true)} className="btn-primary text-sm flex items-center space-x-1.5">
            <Plus className="h-4 w-4" /><span>Add Course</span>
          </button>
        </div>

        {courseEntries.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses in this path yet" description="Add a course to start building this path." />
        ) : (
          <DataTable
            columns={[
              { key: 'orderIndex', label: '#' },
              { key: 'title', label: 'Course', render: (c) => c.course?.title || '(deleted course)' },
              { key: 'difficulty', label: 'Difficulty', render: (c) => c.course ? <span className="badge badge-blue">{c.course.difficulty}</span> : null },
            ]}
            rows={courseEntries}
            actions={(entry) => (
              <button onClick={() => setDeleteTarget({ type: 'course', item: entry, path: selectedPath })} className="btn-ghost px-2! py-1.5! text-red-400!"><Trash2 className="h-3.5 w-3.5" /></button>
            )}
          />
        )}

        {addCourseModal && (
          <AddCourseModal
            path={selectedPath}
            allCourses={allCourses}
            onClose={() => setAddCourseModal(false)}
            onSaved={loadAll}
          />
        )}
        {deleteTarget?.type === 'course' && (
          <ConfirmDialog
            description={`Remove "${deleteTarget.item.course?.title}" from this path?`}
            onConfirm={() => removeCourseFromPath(deleteTarget.path, deleteTarget.item)}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </div>
    );
  }

  // --- Path list view ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Learning Paths</h1>
          <p className="text-slate-500 text-sm mt-1">{paths.length} path{paths.length !== 1 ? 's' : ''} · powers the "Learning Paths" page on the live site.</p>
        </div>
        <button onClick={() => setPathModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Path</span>
        </button>
      </div>

      {paths.length === 0 ? (
        <EmptyState icon={Layers} title="No learning paths yet" description="Create a topic or career-track path, then add courses to it." />
      ) : (
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'pathType', label: 'Type', render: (p) => <span className={`badge ${p.pathType === 'CAREER_TRACK' ? 'badge-purple' : 'badge-blue'}`}>{p.pathType === 'CAREER_TRACK' ? 'Career Track' : 'Topic'}</span> },
            { key: 'courses', label: 'Courses', render: (p) => p.courses?.length || 0 },
          ]}
          rows={paths}
          actions={(path) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setSelectedPath(path)} className="btn-ghost px-2.5! py-1.5! text-xs">Manage Courses</button>
              <button onClick={() => setPathModal(path)} className="btn-ghost px-2! py-1.5!"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget({ type: 'path', item: path })} className="btn-ghost px-2! py-1.5! text-red-400!"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {pathModal && (
        <PathFormModal
          initial={pathModal === 'new' ? null : pathModal}
          onClose={() => setPathModal(null)}
          onSaved={loadAll}
        />
      )}
      {deleteTarget?.type === 'path' && (
        <ConfirmDialog
          description={`Delete "${deleteTarget.item.title}"? This removes the path and its course associations (the courses themselves are not deleted).`}
          onConfirm={() => deletePath(deleteTarget.item)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default LearningPaths;
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const EMPTY_COURSE = { title: '', description: '', thumbnailUrl: '', difficulty: 'Beginner' };
const EMPTY_LESSON = { title: '', videoUrl: '', textContent: '', orderIndex: 1 };

function CourseFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_COURSE);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.put(`/courses/${initial.id}`, form);
      } else {
        await apiClient.post('/courses', form);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Course' : 'New Course'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea required className="field-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Thumbnail URL</label>
          <input required className="field-input" value={form.thumbnailUrl} onChange={e => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <label className="field-label">Difficulty</label>
          <select className="field-select" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })}>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Course'}</button>
        </div>
      </form>
    </Modal>
  );
}

function LessonFormModal({ courseId, initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_LESSON);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, orderIndex: Number(form.orderIndex) };
      if (isEdit) {
        await apiClient.put(`/courses/lessons/${initial.id}`, payload);
      } else {
        await apiClient.post(`/courses/${courseId}/lessons`, payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Lesson' : 'New Lesson'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Video URL</label>
          <input required className="field-input" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=… or a direct .mp4 URL" />
        </div>
        <div>
          <label className="field-label">Text Content</label>
          <textarea required className="field-textarea" value={form.textContent} onChange={e => setForm({ ...form, textContent: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Order Index</label>
          <input required type="number" min="0" className="field-input" value={form.orderIndex} onChange={e => setForm({ ...form, orderIndex: e.target.value })} />
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Lesson'}</button>
        </div>
      </form>
    </Modal>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [courseModal, setCourseModal] = useState(null); // null | 'new' | course object
  const [lessonModal, setLessonModal] = useState(null); // null | 'new' | lesson object
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'course'|'lesson', item }

  const loadCourses = () => {
    setLoading(true);
    apiClient.get('/courses')
      .then(res => {
        setCourses(res.data);
        if (selectedCourse) {
          const fresh = res.data.find(c => c.id === selectedCourse.id);
          setSelectedCourse(fresh || null);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadCourses, []); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteCourse = async (course) => {
    await apiClient.delete(`/courses/${course.id}`);
    if (selectedCourse?.id === course.id) setSelectedCourse(null);
    loadCourses();
  };

  const deleteLesson = async (lesson) => {
    await apiClient.delete(`/courses/lessons/${lesson.id}`);
    loadCourses();
  };

  if (loading) return <PageLoader label="Loading courses…" />;

  // --- Lesson management view for a single course ---
  if (selectedCourse) {
    const lessons = [...(selectedCourse.lessons || [])].sort((a, b) => a.orderIndex - b.orderIndex);
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center space-x-1.5 text-slate-400 hover:text-white text-sm transition">
          <ArrowLeft className="h-3.5 w-3.5" /><span>All Courses</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-white">{selectedCourse.title}</h1>
            <p className="text-slate-500 text-sm mt-1">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setLessonModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
            <Plus className="h-4 w-4" /><span>Add Lesson</span>
          </button>
        </div>

        {lessons.length === 0 ? (
          <EmptyState icon={Layers} title="No lessons yet" description="Add the first lesson to this course." />
        ) : (
          <DataTable
            columns={[
              { key: 'orderIndex', label: '#' },
              { key: 'title', label: 'Title' },
              { key: 'videoUrl', label: 'Video', render: (l) => <span className="text-slate-500 text-xs truncate block max-w-xs">{l.videoUrl}</span> },
            ]}
            rows={lessons}
            actions={(lesson) => (
              <div className="flex justify-end space-x-1.5">
                <button onClick={() => setLessonModal(lesson)} className="btn-ghost !px-2 !py-1.5"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => setDeleteTarget({ type: 'lesson', item: lesson })} className="btn-ghost !px-2 !py-1.5 !text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}
          />
        )}

        {lessonModal && (
          <LessonFormModal
            courseId={selectedCourse.id}
            initial={lessonModal === 'new' ? null : lessonModal}
            onClose={() => setLessonModal(null)}
            onSaved={loadCourses}
          />
        )}
        {deleteTarget?.type === 'lesson' && (
          <ConfirmDialog
            description={`Delete "${deleteTarget.item.title}"? This also removes any student progress on it.`}
            onConfirm={() => deleteLesson(deleteTarget.item)}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </div>
    );
  }

  // --- Course list view ---
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Courses & Lessons</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} published.</p>
        </div>
        <button onClick={() => setCourseModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Course</span>
        </button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses yet" description="Create your first course to get started." />
      ) : (
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'difficulty', label: 'Difficulty', render: (c) => <span className="badge badge-blue">{c.difficulty}</span> },
            { key: 'lessons', label: 'Lessons', render: (c) => c.lessons?.length || 0 },
          ]}
          rows={courses}
          actions={(course) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setSelectedCourse(course)} className="btn-ghost !px-2.5 !py-1.5 text-xs">Manage Lessons</button>
              <button onClick={() => setCourseModal(course)} className="btn-ghost !px-2 !py-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget({ type: 'course', item: course })} className="btn-ghost !px-2 !py-1.5 !text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {courseModal && (
        <CourseFormModal
          initial={courseModal === 'new' ? null : courseModal}
          onClose={() => setCourseModal(null)}
          onSaved={loadCourses}
        />
      )}
      {deleteTarget?.type === 'course' && (
        <ConfirmDialog
          description={`Delete "${deleteTarget.item.title}"? This permanently removes all of its lessons and student progress.`}
          onConfirm={() => deleteCourse(deleteTarget.item)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default Courses;

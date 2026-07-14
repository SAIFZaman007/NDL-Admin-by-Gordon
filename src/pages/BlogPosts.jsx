import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react';
import apiClient from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Toggle from '../components/ui/Toggle';

const EMPTY_POST = { title: '', excerpt: '', content: '', category: '', coverImage: '', readTime: '5 min read', published: false };

function BlogFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await apiClient.put(`/blog/${initial.id}`, form);
      } else {
        await apiClient.post('/blog', form);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Post' : 'New Blog Post'} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Title</label>
          <input required className="field-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Category</label>
            <input required className="field-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="CCNA, CCNP, Career…" />
          </div>
          <div>
            <label className="field-label">Read Time</label>
            <input className="field-input" value={form.readTime} onChange={e => setForm({ ...form, readTime: e.target.value })} placeholder="5 min read" />
          </div>
        </div>
        <div>
          <label className="field-label">Cover Image URL</label>
          <input className="field-input" value={form.coverImage || ''} onChange={e => setForm({ ...form, coverImage: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <label className="field-label">Excerpt</label>
          <textarea required className="field-textarea" style={{ minHeight: 60 }} value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Content</label>
          <textarea required className="field-textarea" style={{ minHeight: 160 }} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
        </div>
        <Toggle label="Published" checked={!!form.published} onChange={v => setForm({ ...form, published: v })} />
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Post'}</button>
        </div>
      </form>
    </Modal>
  );
}

function BlogPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    apiClient.get('/blog/admin/all').then(res => setPosts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const togglePublish = async (post) => {
    await apiClient.patch(`/blog/${post.id}/publish`);
    load();
  };

  const remove = async (post) => {
    await apiClient.delete(`/blog/${post.id}`);
    load();
  };

  if (loading) return <PageLoader label="Loading blog posts…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} post{posts.length !== 1 ? 's' : ''} (including drafts).</p>
        </div>
        <button onClick={() => setModal('new')} className="btn-primary text-sm flex items-center space-x-1.5">
          <Plus className="h-4 w-4" /><span>New Post</span>
        </button>
      </div>

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title="No blog posts yet" description="Publish your first article to get started." />
      ) : (
        <DataTable
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'category', label: 'Category', render: (p) => <span className="badge badge-purple">{p.category}</span> },
            {
              key: 'published', label: 'Status',
              render: (p) => (
                <button onClick={() => togglePublish(p)} className={`badge ${p.published ? 'badge-green' : 'badge-slate'}`}>
                  {p.published ? 'Published' : 'Draft'}
                </button>
              ),
            },
            {
              key: 'createdAt', label: 'Created',
              render: (p) => new Date(p.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
            },
          ]}
          rows={posts}
          actions={(post) => (
            <div className="flex justify-end space-x-1.5">
              <button onClick={() => setModal(post)} className="btn-ghost !px-2 !py-1.5"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(post)} className="btn-ghost !px-2 !py-1.5 !text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          )}
        />
      )}

      {modal && (
        <BlogFormModal initial={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSaved={load} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          description={`Delete "${deleteTarget.title}"? This can't be undone.`}
          onConfirm={() => remove(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

export default BlogPosts;

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Newspaper, ImagePlus, X } from 'lucide-react';
import apiClient, { API_BASE } from '../api/client';
import DataTable from '../components/ui/DataTable';
import PageLoader from '../components/ui/PageLoader';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Toggle from '../components/ui/Toggle';

const EMPTY_POST = { title: '', excerpt: '', content: '', category: '', coverImage: '', readTime: '5 min read', published: false };

// Uploaded covers are stored by the backend as relative paths
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
export const resolveImageUrl = (url) => (url && url.startsWith('/') ? `${API_ORIGIN}${url}` : url);

// Mirror the backend's validation so obvious mistakes are caught before a network round-trip. The backend re-validates everything regardless.
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB — matches blog_router.py

function BlogFormModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(initial || EMPTY_POST);
  const [saving, setSaving] = useState(false);
  const [coverFile, setCoverFile] = useState(null);      
  const [coverPreview, setCoverPreview] = useState(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);
  const isEdit = !!initial?.id;

  // Object URLs hold browser memory until revoked — clean up on change/unmount.
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFileError('Unsupported file type. Use JPEG, PNG, WEBP, or GIF.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError('Image is larger than 5 MB. Please choose a smaller file.');
      e.target.value = '';
      return;
    }
    setFileError('');
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const clearSelectedFile = () => {
    if (coverPreview) URL.revokeObjectURL(coverPreview);
    setCoverFile(null);
    setCoverPreview(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // The backend's POST /blog and PUT /blog/{id} now consume multipart/form-data with coverImage as an actual file upload.
      const payload = new FormData();
      payload.append('title', form.title);
      payload.append('excerpt', form.excerpt);
      payload.append('content', form.content);
      payload.append('category', form.category);
      payload.append('readTime', form.readTime || '5 min read');
      payload.append('published', form.published ? 'true' : 'false');
      if (coverFile) {
        // Only send coverImage when the admin actually picked a file — on edit, omitting it keeps the current image untouched.
        payload.append('coverImage', coverFile);
      }

      if (isEdit) {
        await apiClient.put(`/blog/${initial.id}`, payload);
      } else {
        await apiClient.post('/blog', payload);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // What to show in the preview slot: the freshly picked file wins, otherwise the post's existing image (on edit), otherwise nothing.
  const previewSrc = coverPreview || (isEdit ? resolveImageUrl(form.coverImage) : null);

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

        {/* Cover image — uploaded directly from the admin's device */}
        <div>
          <label className="field-label">Cover Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(',')}
            onChange={handleFileChange}
            className="hidden"
            id="blog-cover-file"
          />
          {previewSrc ? (
            <div className="relative rounded-xl overflow-hidden border border-white/10">
              <img src={previewSrc} alt="Cover preview" className="w-full h-40 object-cover" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-sm">
                <span className="text-xs text-slate-300 truncate pr-2">
                  {coverFile ? coverFile.name : 'Current cover image'}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-ghost px-2! py-1! text-xs">
                    Replace
                  </button>
                  {coverFile && (
                    <button type="button" onClick={clearSelectedFile} className="btn-ghost px-2! py-1! text-xs text-red-400!" title="Discard selected file">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-28 rounded-xl border border-dashed border-white/15 hover:border-blue-400/50 hover:bg-white/2 transition flex flex-col items-center justify-center space-y-1.5 text-slate-500 hover:text-slate-300"
            >
              <ImagePlus className="h-5 w-5" />
              <span className="text-xs font-medium">Click to upload a cover image from your device</span>
              <span className="text-[10px]">JPEG, PNG, WEBP or GIF — up to 5 MB</span>
            </button>
          )}
          {fileError && <p className="text-xs text-red-400 mt-1.5">{fileError}</p>}
          {isEdit && !coverFile && (
            <p className="text-[11px] text-slate-600 mt-1.5">Leave as-is to keep the current image — uploading a new file replaces it.</p>
          )}
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
            {
              key: 'title', label: 'Title',
              render: (p) => (
                <div className="flex items-center space-x-3">
                  {p.coverImage ? (
                    <img src={resolveImageUrl(p.coverImage)} alt="" className="h-8 w-12 rounded object-cover border border-white/10 shrink-0" />
                  ) : (
                    <div className="h-8 w-12 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      <Newspaper className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                  )}
                  <span>{p.title}</span>
                </div>
              ),
            },
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
              <button onClick={() => setModal(post)} className="btn-ghost px-2! py-1.5!"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => setDeleteTarget(post)} className="btn-ghost px-2! py-1.5! text-red-400!"><Trash2 className="h-3.5 w-3.5" /></button>
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
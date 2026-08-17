import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import RichTextEditor from "../../components/RichTextEditor.jsx";

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "", author: "Admin", isPublished: true,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/blogs/admin/${id}`).then((res) => {
        const blog = res.data;
        if (blog) setForm({ ...blog });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleContentChange = (html) => {
    setForm((prev) => ({ ...prev, content: html }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (coverImage) fd.append("coverImage", coverImage);

      if (isEdit) {
        await api.put(`/blogs/admin/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/blogs/admin", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin/blogs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="font-display font-700 text-2xl mb-8">{isEdit ? "Edit Post" : "New Post"}</h1>
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <Field label="Title"><input name="title" required value={form.title} onChange={handleChange} className="input" /></Field>
        <Field label="Excerpt (short summary for cards)">
          <input name="excerpt" required value={form.excerpt} onChange={handleChange} className="input" />
        </Field>
        <Field label="Content — use the toolbar for bold, italic, links, headings, and inline images">
          <RichTextEditor value={form.content} onChange={handleContentChange} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category"><input name="category" required value={form.category} onChange={handleChange} className="input" /></Field>
          <Field label="Author"><input name="author" value={form.author} onChange={handleChange} className="input" /></Field>
        </div>
        <Field label="Cover image"><input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} className="input" /></Field>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={handleChange} />
          Published (visible on blog)
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 disabled:opacity-60">
          {saving ? "Saving..." : "Save Post"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      {children}
    </div>
  );
}

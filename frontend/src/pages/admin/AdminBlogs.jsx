import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/blogs/admin/all").then((res) => setBlogs(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    await api.delete(`/blogs/admin/${id}`);
    load();
  };

  const categories = [...new Set(blogs.map((b) => b.category).filter(Boolean))].sort();
  const q = search.trim().toLowerCase();
  const filtered = blogs.filter((b) => {
    const inCategory = !category || b.category === category;
    const inSearch = !q || b.title.toLowerCase().includes(q) || (b.category || "").toLowerCase().includes(q);
    return inCategory && inSearch;
  });

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-700 text-2xl">Blog Posts</h1>
        <Link to="/admin/blogs/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Post
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6 items-start">
        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm w-full lg:w-72 focus:border-gold outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-2 rounded-lg text-sm border capitalize transition ${
              category === "" ? "bg-gold text-ink border-gold" : "border-border text-text-muted hover:text-gold hover:border-gold/60"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-lg text-sm border capitalize transition ${
                category === c ? "bg-gold text-ink border-gold" : "border-border text-text-muted hover:text-gold hover:border-gold/60"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4">Published</th>
              <th className="p-4">Date</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4">{b.title}</td>
                <td className="p-4 text-text-muted capitalize">{b.category}</td>
                <td className="p-4">{b.isPublished ? "Yes" : "No"}</td>
                <td className="p-4 text-text-faint">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  <Link to={`/admin/blogs/${b._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-text-faint">No blog posts found.</p>}
      </div>
    </div>
  );
}

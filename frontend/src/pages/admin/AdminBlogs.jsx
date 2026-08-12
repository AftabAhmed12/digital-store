import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display font-700 text-2xl">Blog Posts</h1>
        <Link to="/admin/blogs/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Post
        </Link>
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
            {blogs.map((b) => (
              <tr key={b._id} className="border-b border-border last:border-0">
                <td className="p-4">{b.title}</td>
                <td className="p-4 text-text-muted capitalize">{b.category}</td>
                <td className="p-4">{b.isPublished ? "Yes" : "No"}</td>
                <td className="p-4 text-text-faint">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right space-x-3">
                  <Link to={`/admin/blogs/${b._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs.length === 0 && <p className="p-8 text-center text-text-faint">No blog posts yet.</p>}
      </div>
    </div>
  );
}

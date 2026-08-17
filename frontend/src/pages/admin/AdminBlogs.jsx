import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import CategoryFilter from "../../components/CategoryFilter.jsx";
import Pagination from "../../components/Pagination.jsx";
import { canAccess } from "../../utils/adminAccess.js";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const PAGE_SIZE = 10;

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (category) params.category = category;
    if (search.trim()) params.search = search.trim();
    api
      .get("/blogs/admin/all", { params })
      .then((res) => {
        setBlogs(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useOnceEffect(() => {
    api.get("/blogs/categories").then((res) => setCategories(res.data));
  }, []);

  // Filters always reload from page 1; changing page only refetches that page.
  useOnceEffect(() => {
    setPage(1);
    load(1);
  }, [category, search]);

  useOnceEffect(() => {
    if (page !== 1) load(page);
  }, [page]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    await api.delete(`/blogs/admin/${id}`);
    if (blogs.length === 1 && page > 1) setPage((p) => p - 1);
    else load();
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-700 text-2xl">Blog Posts</h1>
        {canAccess("blogs", "create") && (
          <Link to="/admin/blogs/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
            + New Post
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6 items-start">
        <input
          type="text"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm w-full lg:w-72 focus:border-gold outline-none"
        />
        <CategoryFilter
          categories={categories}
          active={category}
          onChange={setCategory}
          label="All Categories"
        />
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
              <tr key={b._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4">{b.title}</td>
                <td className="p-4 text-text-muted capitalize">{b.category}</td>
                <td className="p-4">{b.isPublished ? "Yes" : "No"}</td>
                <td className="p-4 text-text-faint">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  {canAccess("blogs", "edit") && (
                    <Link to={`/admin/blogs/${b._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  )}
                  {canAccess("blogs", "delete") && (
                    <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:underline">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {blogs.length === 0 && <p className="p-8 text-center text-text-faint">No blog posts found.</p>}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}

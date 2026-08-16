import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import CategoryFilter from "../../components/CategoryFilter.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const load = () => {
    setLoading(true);
    api.get("/products/admin/all").then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await api.delete(`/products/admin/${id}`);
    load();
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();
  const q = search.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const inCategory = !category || p.category === category;
    const inSearch = !q || p.title.toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
    return inCategory && inSearch;
  });

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-700 text-2xl">Products</h1>
        <Link to="/admin/products/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Product
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
              <th className="p-4">Price</th>
              <th className="p-4">Sales</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4">{p.title}</td>
                <td className="p-4 text-text-muted capitalize">{p.category}</td>
                <td className="p-4 font-mono">${p.price.toFixed(2)}</td>
                <td className="p-4">{p.salesCount}</td>
                <td className="p-4">{p.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  <Link to={`/admin/products/${p._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-text-faint">No products found.</p>}
      </div>
    </div>
  );
}

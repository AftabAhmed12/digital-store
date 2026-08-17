import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import CategoryFilter from "../../components/CategoryFilter.jsx";
import Pagination from "../../components/Pagination.jsx";
import { canAccess } from "../../utils/adminAccess.js";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const PAGE_SIZE = 10;

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
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
      .get("/products/admin/all", { params })
      .then((res) => {
        setProducts(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  // Categories now come from the API (not client-side) since the table is paginated.
  useOnceEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
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
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await api.delete(`/products/admin/${id}`);
    if (products.length === 1 && page > 1) setPage((p) => p - 1);
    else load();
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-700 text-2xl">Products</h1>
        {canAccess("products", "create") && (
          <Link to="/admin/products/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
            + New Product
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
              <th className="p-4">Price</th>
              <th className="p-4">Sales</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4">{p.title}</td>
                <td className="p-4 text-text-muted capitalize">{p.category}</td>
                <td className="p-4 font-mono">
                  {Number(p.discountPercent) > 0 ? (
                    <span>
                      <span className="text-gold">${(p.price * (1 - Number(p.discountPercent) / 100)).toFixed(2)}</span>{" "}
                      <span className="text-text-faint line-through">${p.price.toFixed(2)}</span>{" "}
                      <span className="text-[11px] bg-gold/15 text-gold font-bold px-1.5 py-0.5 rounded">{Math.round(p.discountPercent)}%</span>
                    </span>
                  ) : (
                    `$${p.price.toFixed(2)}`
                  )}
                </td>
                <td className="p-4">{p.salesCount}</td>
                <td className="p-4">{p.isActive ? "Yes" : "No"}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  {canAccess("products", "edit") && (
                    <Link to={`/admin/products/${p._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  )}
                  {canAccess("products", "delete") && (
                    <button onClick={() => handleDelete(p._id)} className="text-red-400 hover:underline">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-text-faint">No products found.</p>}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}

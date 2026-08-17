import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";

const fmtMoney = (v) => (Number(v) || 0).toFixed(2);

const PAGE_SIZE = 10;

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = page) => {
    setLoading(true);
    api
      .get("/coupons/admin/all", { params: { page: p, limit: PAGE_SIZE } })
      .then((res) => {
        setCoupons(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleDelete = async (c) => {
    if (!confirm(`Delete coupon ${c.code}? This cannot be undone.`)) return;
    await api.delete(`/coupons/admin/${c._id}`);
    load();
  };

  const toggleActive = async (c) => {
    await api.put(`/coupons/admin/${c._id}`, { isActive: !c.isActive });
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-700 text-2xl">Coupons</h1>
          <p className="text-text-faint text-sm mt-1">
            A coupon can apply to many products, and a product can have many coupons.
          </p>
        </div>
        <Link to="/admin/coupons/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Coupon
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Applies to</th>
              <th className="p-4">Min order</th>
              <th className="p-4">Uses</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4 font-mono font-semibold text-gold">{c.code}</td>
                <td className="p-4 font-mono">
                  {c.type === "percent" ? `${c.value}% off` : `$${fmtMoney(c.value)} off`}
                </td>
                <td className="p-4 text-text-muted">
                  {c.appliesToAll ? (
                    <span className="text-teal">All products</span>
                  ) : (
                    <>
                      {c.products.length} product{c.products.length === 1 ? "" : "s"}
                      {c.appliesToCategories?.length > 0 && (
                        <span className="text-text-faint">
                          {" "}· {c.appliesToCategories.length} categor{c.appliesToCategories.length === 1 ? "y" : "ies"}
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td className="p-4 font-mono">{c.minAmount > 0 ? `$${fmtMoney(c.minAmount)}` : "—"}</td>
                <td className="p-4">{c.maxUses ? `${c.usedCount} / ${c.maxUses}` : c.usedCount}</td>
                <td className="p-4 text-text-muted">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      c.isActive
                        ? "bg-teal/10 border-teal/40 text-teal hover:bg-teal/20"
                        : "bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  <Link to={`/admin/coupons/${c._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(c)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-8 text-center text-text-faint">No coupons yet. Create your first one!</p>}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}
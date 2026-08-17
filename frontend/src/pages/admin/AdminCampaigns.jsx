import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";

const PAGE_SIZE = 10;

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = page) => {
    setLoading(true);
    api
      .get("/campaigns/admin/all", { params: { page: p, limit: PAGE_SIZE } })
      .then((res) => {
        setCampaigns(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleDelete = async (c) => {
    if (!confirm(`Delete campaign "${c.title}" and its coupon ${c.coupon?.code}? This cannot be undone.`)) return;
    await api.delete(`/campaigns/admin/${c._id}`);
    load();
  };

  const toggleActive = async (c) => {
    await api.put(`/campaigns/admin/${c._id}`, { isActive: !c.isActive });
    load();
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-700 text-2xl">Campaigns</h1>
          <p className="text-text-faint text-sm mt-1">
            Promo banners (e.g. Father&apos;s Day) shown full-width on the storefront. Each campaign owns a coupon code.
          </p>
        </div>
        <Link to="/admin/campaigns/new" className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
          + New Campaign
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[820px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Poster</th>
              <th className="p-4">Title</th>
              <th className="p-4">Coupon</th>
              <th className="p-4">Applies to</th>
              <th className="p-4">Ends</th>
              <th className="p-4">Active</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4">
                  {c.posterImage?.url ? (
                    <img src={c.posterImage.url} alt={c.title} className="w-24 h-14 object-cover rounded-md border border-border" loading="lazy" />
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="p-4 font-medium">{c.title}</td>
                <td className="p-4 font-mono text-gold">{c.coupon?.code}</td>
                <td className="p-4 text-text-muted">
                  {c.coupon?.appliesToAll ? (
                    <span className="text-teal">All products</span>
                  ) : (
                    <>
                      {c.coupon?.products?.length || 0} product{(c.coupon?.products?.length || 0) === 1 ? "" : "s"}
                      {(c.coupon?.appliesToCategories?.length || 0) > 0 && (
                        <span className="text-text-faint">
                          {" "}· {c.coupon.appliesToCategories.length} categor{c.coupon.appliesToCategories.length === 1 ? "y" : "ies"}
                        </span>
                      )}
                    </>
                  )}
                </td>
                <td className="p-4 text-text-muted">
                  {c.coupon?.expiresAt ? new Date(c.coupon.expiresAt).toLocaleDateString() : "No expiry"}
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
                  <Link to={`/admin/campaigns/${c._id}/edit`} className="text-blue hover:underline">Edit</Link>
                  <button onClick={() => handleDelete(c)} className="text-red-400 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {campaigns.length === 0 && <p className="p-8 text-center text-text-faint">No campaigns yet. Create your first one!</p>}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}
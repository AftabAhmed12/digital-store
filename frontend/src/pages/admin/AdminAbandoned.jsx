import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import ProductTitleLink from "../../components/ProductTitleLink.jsx";
import Pagination from "../../components/Pagination.jsx";

const PAGE_SIZE = 10;

export default function AdminAbandoned() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get("/orders/admin/cancelled", { params: { page, limit: PAGE_SIZE } })
      .then((res) => {
        setOrders(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const copyEmail = (email) => {
    navigator.clipboard?.writeText(email);
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-700 text-2xl">Abandoned Checkouts</h1>
        <span className="text-xs text-text-faint font-mono">{orders.length} recorded</span>
      </div>
      <p className="text-text-faint text-sm mb-8">
        Customers who started a checkout but cancelled before paying. Reach out to recover the sale.
      </p>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Customer</th>
              <th className="p-4">Product</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Attempted on</th>
              <th className="p-4">Cancelled on</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border last:border-0">
                <td className="p-4 text-text-muted">{o.customerEmail}</td>
                <td className="p-4"><ProductTitleLink slug={o.product?.slug} title={o.productTitle} /></td>
                <td className="p-4 font-mono">${(o.amount / 100).toFixed(2)}</td>
                <td className="p-4 text-text-faint">{new Date(o.createdAt).toLocaleString()}</td>
                <td className="p-4 text-text-faint">
                  {o.cancelledAt ? new Date(o.cancelledAt).toLocaleString() : "—"}
                </td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => copyEmail(o.customerEmail)}
                    className="text-blue hover:underline"
                    title="Copy email"
                  >
                    Copy email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-text-faint">No abandoned checkouts yet.</p>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}
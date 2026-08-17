import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { StatusBadge } from "./AdminDashboard.jsx";
import ProductTitleLink from "../../components/ProductTitleLink.jsx";
import Pagination from "../../components/Pagination.jsx";

const PAGE_SIZE = 10;

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = page) => {
    setLoading(true);
    api
      .get("/orders/admin/all", { params: { page: p, limit: PAGE_SIZE } })
      .then((res) => {
        setOrders(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const handleResend = async (id) => {
    setResending(id);
    try {
      await api.post(`/orders/admin/${id}/resend`);
      load();
    } finally {
      setResending(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <h1 className="font-display font-700 text-2xl mb-8">Orders</h1>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[850px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-border last:border-0">
                <td className="p-4"><ProductTitleLink slug={o.product?.slug} title={o.productTitle} /></td>
                <td className="p-4 text-text-muted">{o.customerEmail}</td>
                <td className="p-4 font-mono">${(o.amount / 100).toFixed(2)}</td>
                <td className="p-4">
                  {o.discountAmount > 0 ? (
                    <span className="text-teal">
                      -${(o.discountAmount / 100).toFixed(2)}
                      {o.couponCode && <span className="text-text-faint ml-1 font-mono">({o.couponCode})</span>}
                    </span>
                  ) : (
                    <span className="text-text-faint">—</span>
                  )}
                </td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
                <td className="p-4 text-text-faint">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  {o.status !== "pending" && (
                    <button
                      onClick={() => handleResend(o._id)}
                      disabled={resending === o._id}
                      className="text-blue hover:underline disabled:opacity-50"
                    >
                      {resending === o._id ? "Sending..." : "Resend email"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="p-8 text-center text-text-faint">No orders yet.</p>}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}

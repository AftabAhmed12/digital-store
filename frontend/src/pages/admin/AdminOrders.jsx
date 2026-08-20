import { useEffect, useRef, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import { StatusBadge } from "./AdminDashboard.jsx";
import ProductTitleLink from "../../components/ProductTitleLink.jsx";
import Pagination from "../../components/Pagination.jsx";
import { canAccess } from "../../utils/adminAccess.js";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "email_sent", label: "Email sent" },
  { value: "email_failed", label: "Email failed" },
];

// Themed dropdown — replaces the native select so the button and options
// follow the app's design language (consistent padding, hover, focus states).
function StatusFilter({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const hide = () => {
    if (!open) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  };

  useEffect(() => {
    if (!open && !closing) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) hide();
    };
    const onScroll = (e) => {
      if (ref.current && ref.current.contains(e.target)) return;
      hide();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [open, closing]);

  const select = (val) => {
    onChange(val);
    clearTimeout(timerRef.current);
    setClosing(false);
    setOpen(false);
  };

  const active = STATUS_FILTERS.find((s) => s.value === value) || STATUS_FILTERS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => {
          if (open || closing) {
            hide();
          } else {
            clearTimeout(timerRef.current);
            setClosing(false);
            setOpen(true);
          }
        }}
        className={`flex items-center justify-between gap-3 min-w-[10rem] bg-surface border rounded-lg px-4 py-2.5 text-sm transition-colors outline-none ${
          open ? "border-gold" : "border-border hover:border-teal"
        }`}
      >
        <span className={`truncate capitalize ${value ? "text-text-primary" : "text-text-faint"}`}>{active.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`w-4 h-4 shrink-0 text-text-faint transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {(open || closing) && (
        <div
          aria-hidden={!open}
          className={`absolute z-20 mt-2 w-full min-w-[13rem] bg-surface border border-border rounded-xl shadow-xl overflow-hidden dropdown-anim ${
            closing ? "dropdown-closing" : ""
          }`}
        >
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => select(s.value)}
              className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors ${
                value === s.value ? "bg-surface2 text-gold font-semibold" : "text-text-muted hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("");

  const load = (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (status) params.status = status;
    api
      .get("/orders/admin/all", { params })
      .then((res) => {
        setOrders(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useOnceEffect(load, [page, status]);

  const handleStatusChange = (val) => {
    setStatus(val);
    setPage(1);
  };

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

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <label className="text-sm text-text-faint">Filter by status</label>
        <StatusFilter value={status} onChange={handleStatusChange} />
      </div>

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
                  {o.status !== "pending" && canAccess("orders", "edit") && (
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

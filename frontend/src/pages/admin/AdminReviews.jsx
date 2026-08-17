import { useEffect, useRef, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import ProductTitleLink from "../../components/ProductTitleLink.jsx";
import { Stars } from "../../components/ProductReviews.jsx";
import Pagination from "../../components/Pagination.jsx";
import { canAccess } from "../../utils/adminAccess.js";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const PAGE_SIZE = 10;

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400",
  approved: "bg-teal/10 text-teal",
  rejected: "bg-red-500/10 text-red-400",
};

function StatusBadge({ status }) {
  return <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[status] || ""}`}>{status}</span>;
}

// Themed dropdown — replaces the native select so options can have proper hover effects
function ThemedSelect({ value, onChange, options, placeholder }) {
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
        className={`flex items-center justify-between gap-3 w-full md:w-56 bg-surface border rounded-lg px-4 py-2.5 text-sm transition-colors outline-none ${
          open ? "border-gold" : "border-border hover:border-teal"
        }`}
      >
        <span className={`truncate ${value ? "text-text-primary capitalize" : "text-text-faint"}`}>
          {value || placeholder}
        </span>
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
          <button
            type="button"
            onClick={() => select("")}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              value === "" ? "bg-surface2 text-gold font-semibold" : "text-text-muted hover:bg-surface2 hover:text-text-primary"
            }`}
          >
            All categories
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => select(opt)}
              className={`w-full text-left px-4 py-2.5 text-sm capitalize transition-colors ${
                value === opt ? "bg-surface2 text-gold font-semibold" : "text-text-muted hover:bg-surface2 hover:text-text-primary"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Detail view — renders the full review safely (long comments wrap, never break the layout)
function ReviewDetail({ review, open, onClose, onApprove, onReject, onDelete }) {
  return (
    <Modal open={open} onClose={onClose} size="max-w-xl">
      {review && (
        <>
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="font-display font-700 text-xl break-words">Review from {review.name}</h3>
            <button onClick={onClose} aria-label="Close" className="text-text-faint hover:text-text-primary shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Stars value={review.rating} size={16} />
            <StatusBadge status={review.status} />
            <span className="text-text-faint text-xs">{new Date(review.createdAt).toLocaleString()}</span>
          </div>

          <div className="bg-ink border border-border rounded-xl p-4 mb-5 text-sm space-y-3">
            <p><span className="text-text-faint">Product:</span> <span className="text-text-primary">{review.productTitle}</span></p>
            <p className="break-words"><span className="text-text-faint">Category:</span> <span className="text-text-primary capitalize">{review.category || "—"}</span></p>
            <p className="break-words"><span className="text-text-faint">Email:</span> <a href={`mailto:${review.email}`} className="text-blue break-all">{review.email}</a></p>
            {review.title && <p className="break-words"><span className="text-text-faint">Title:</span> <span className="text-text-primary">{review.title}</span></p>}
          </div>

          <p className="text-text-muted text-sm leading-relaxed whitespace-pre-wrap break-words mb-6">
            {review.comment}
          </p>

          <div className="flex flex-wrap gap-3">
            {canAccess("reviews", "edit") && review.status !== "approved" && (
              <button onClick={() => onApprove(review._id)} className="bg-teal text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
                Approve
              </button>
            )}
            {canAccess("reviews", "edit") && review.status !== "rejected" && (
              <button onClick={() => onReject(review._id)} className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
                Reject
              </button>
            )}
            {canAccess("reviews", "delete") && (
              <button onClick={() => onDelete(review._id)} className="bg-red-500/10 text-red-400 border border-red-500/30 font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110">
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = (p = page) => {
    setLoading(true);
    const params = { page: p, limit: PAGE_SIZE };
    if (category) params.category = category;
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();
    api
      .get("/reviews/admin/all", { params })
      .then((res) => {
        setReviews(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  };

  useOnceEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  // Filters always reload from page 1; changing page only refetches that page.
  useOnceEffect(() => {
    setPage(1);
    load(1);
  }, [category, status, search]);

  useOnceEffect(() => {
    if (page !== 1) load(page);
  }, [page]);

  const handleApprove = async (id) => {
    await api.put(`/reviews/admin/${id}`, { status: "approved" });
    setDetail(null);
    load();
  };

  const handleReject = async (id) => {
    await api.put(`/reviews/admin/${id}`, { status: "rejected" });
    setDetail(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    await api.delete(`/reviews/admin/${id}`);
    setDetail(null);
    load();
  };

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-700 text-2xl">Reviews</h1>
        <span className="text-xs text-text-faint font-mono">{total} total</span>
      </div>
      <p className="text-text-faint text-sm mb-8">
        Customer reviews need approval before they appear on the product page.
      </p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative w-full md:w-80">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, product or review…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:border-gold outline-none transition-colors"
          />
        </div>
        <ThemedSelect
          value={category}
          onChange={setCategory}
          options={categories}
          placeholder="All categories"
        />
        <div className="flex gap-2">
          {[
            { value: "", label: "All" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setStatus(s.value)}
              className={`px-4 py-2 rounded-lg text-sm border ${
                status === s.value ? "bg-gold text-ink border-gold" : "border-border text-text-muted hover:border-teal"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader /></div>
        ) : (
          <>
            <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Reviewer</th>
              <th className="p-4">Rating</th>
              <th className="p-4">Submitted</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r._id} className="border-b border-border last:border-0 align-top">
                <td className="p-4 min-w-[180px]">
                  <ProductTitleLink slug={r.product?.slug} title={r.productTitle} />
                  <p className="text-text-faint text-xs capitalize">{r.category || ""}</p>
                </td>
                <td className="p-4 min-w-[200px]">
                  <p>{r.name}</p>
                  <p className="text-text-faint text-xs break-all">{r.email}</p>
                </td>
                <td className="p-4"><Stars value={r.rating} size={14} /></td>
                <td className="p-4 text-text-faint whitespace-nowrap">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-4"><StatusBadge status={r.status} /></td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  <button onClick={() => setDetail(r)} className="text-blue hover:underline">View</button>
                  {canAccess("reviews", "edit") && r.status !== "approved" && (
                    <button onClick={() => handleApprove(r._id)} className="text-teal hover:underline">Approve</button>
                  )}
                  {canAccess("reviews", "delete") && (
                    <button onClick={() => handleDelete(r._id)} className="text-red-400 hover:underline">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
          {reviews.length === 0 && (
            <p className="p-8 text-center text-text-faint">No reviews match your filters yet.</p>
          )}
          <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
          </>
        )}
      </div>

      <ReviewDetail
        review={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        onApprove={async (id) => { await handleApprove(id); }}
        onReject={async (id) => { await handleReject(id); }}
        onDelete={async (id) => { await handleDelete(id); }}
      />
    </div>
  );
}
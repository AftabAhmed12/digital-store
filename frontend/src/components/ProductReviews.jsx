import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Modal from "./Modal.jsx";

// Star rating display (filled based on value) — supports half steps (3.5, 4.5, …)
const STAR_PATH = "M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.4l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5Z";

export function Stars({ value, size = 16, interactive, onChange }) {
  const handleStarClick = (n, e) => {
    if (!interactive || !onChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    onChange(Math.max(1, isLeftHalf ? n - 0.5 : n));
  };

  return (
    <div className={`flex items-center gap-0.5 ${interactive ? "select-none" : ""}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const pct = Math.max(0, Math.min(1, value - (n - 1))) * 100;
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={(e) => handleStarClick(n, e)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            title={interactive ? "Click the left half for a half star" : undefined}
            className={interactive ? "transition-transform hover:scale-110" : ""}
          >
            <span className="relative block" style={{ width: size, height: size }}>
              <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgb(var(--color-text-faint))"
                strokeWidth="1.5"
                className="absolute inset-0"
              >
                <path d={STAR_PATH} />
              </svg>
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
                <svg
                  width={size}
                  height={size}
                  viewBox="0 0 24 24"
                  fill="rgb(var(--color-gold))"
                  stroke="rgb(var(--color-gold))"
                  strokeWidth="1.5"
                  className="absolute inset-0"
                >
                  <path d={STAR_PATH} />
                </svg>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

const inputCls =
  "w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none";

const INITIAL_VISIBLE = 4;
const INCREMENT = 4;

export default function ProductReviews({ product }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", rating: 5, title: "", comment: "" });
  const [status, setStatus] = useState({ submitting: false, success: false, error: "" });

  const load = () => {
    if (!product?._id) return;
    setLoading(true);
    api
      .get(`/reviews/product/${product._id}`)
      .then((res) => {
        setReviews(res.data.reviews || []);
        setAverage(res.data.averageRating || 0);
        setTotal(res.data.total || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [product?._id]);

  const openModal = () => {
    setStatus({ submitting: false, success: false, error: "" });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ submitting: true, success: false, error: "" });
    try {
      await api.post("/reviews", { product: product._id, ...form });
      setStatus({ submitting: false, success: true, error: "" });
      setForm({ name: "", email: "", rating: 5, title: "", comment: "" });
    } catch (err) {
      setStatus({ submitting: false, success: false, error: err.response?.data?.message || "Failed to submit review" });
    }
  };

  const shown = reviews.slice(0, visible);
  const hasMore = visible < reviews.length;

  return (
    <section className="mt-20 border-t border-border pt-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display font-700 text-2xl">Customer Reviews</h2>
          {total > 0 ? (
            <div className="flex items-center gap-3 mt-2">
              <Stars value={average} />
              <span className="text-text-faint text-sm">
                {average.toFixed(1)} out of 5 · {total} review{total > 1 ? "s" : ""}
              </span>
            </div>
          ) : (
            <p className="text-text-faint text-sm mt-2">No reviews yet — be the first to share your experience.</p>
          )}
        </div>

        <button
          onClick={openModal}
          className="btn-3d inline-flex items-center gap-2 bg-gold text-ink font-semibold px-5 py-3 rounded-lg whitespace-nowrap"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Approved reviews */}
      {loading ? (
        <p className="text-text-faint text-sm py-6">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-faint text-sm mb-4">
            No reviews yet — be the first to share your experience.
          </p>
          <button
            onClick={openModal}
            className="border border-gold text-gold font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-gold hover:text-ink transition-colors"
          >
            Add the first review
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            {shown.map((r) => (
              <article key={r._id} className="bg-surface border border-border rounded-xl p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-surface2 border border-border flex items-center justify-center font-display font-600 text-gold">
                      {r.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{r.name}</p>
                      <p className="text-text-faint text-xs">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <Stars value={r.rating} size={15} />
                </div>
                {r.title && <h3 className="font-display font-600 mb-1.5">{r.title}</h3>}
                <p className="text-text-muted text-sm leading-relaxed break-words whitespace-pre-wrap">{r.comment}</p>
              </article>
            ))}
          </div>

          {hasMore && (
            <div className="flex flex-col items-center gap-2 mt-8">
              <button
                onClick={() => setVisible((v) => v + INCREMENT)}
                className="inline-flex items-center gap-2 border border-border text-text-primary font-semibold px-6 py-3 rounded-lg text-sm hover:border-teal hover:text-teal transition-colors"
              >
                Show more reviews
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <span className="text-text-faint text-xs">
                Showing {visible > reviews.length ? reviews.length : visible} of {reviews.length}
              </span>
            </div>
          )}
        </>
      )}

      {/* Write-a-review modal */}
      <Modal open={modalOpen} onClose={closeModal} size="max-w-lg">
        <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <h3 className="font-display font-700 text-xl">Write a Review</h3>
                <p className="text-text-faint text-sm mt-1">No account needed — reviews appear after approval.</p>
              </div>
              <button onClick={() => setModalOpen(false)} aria-label="Close" className="text-text-faint hover:text-text-primary shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {status.success ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto rounded-full bg-teal/10 border border-teal/30 flex items-center justify-center mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgb(var(--color-teal))" strokeWidth="2.5" className="w-7 h-7">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="font-display font-600 text-lg mb-1">Review submitted!</p>
                <p className="text-text-faint text-sm mb-6">It will show up here once approved.</p>
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gold text-ink font-semibold px-6 py-2.5 rounded-lg text-sm hover:brightness-110 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Your name</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Sarah Mitchell" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Your email</label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="sarah.mitchell@gmail.com" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Rating</label>
                  <div className="flex items-center gap-3">
                    <Stars value={form.rating} size={26} interactive onChange={(n) => setForm({ ...form, rating: n })} />
                    <span className="font-mono text-sm text-gold">{form.rating.toFixed(1)} / 5</span>
                  </div>
                  <p className="text-text-faint text-xs mt-2">Click the left half of a star for a half rating (e.g. 3.5).</p>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">
                    Review title <span className="text-text-faint">(optional)</span>
                  </label>
                  <input name="title" value={form.title} onChange={handleChange} placeholder="Worth every penny — highly recommended" className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Your review</label>
                  <textarea name="comment" required rows={5} value={form.comment} onChange={handleChange}
                    placeholder="I've been using this for a few weeks now and it's made a real difference to my workflow…" className={`${inputCls} resize-none`} />
                </div>
                {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 border border-border text-text-muted font-semibold py-3 rounded-lg text-sm hover:text-text-primary hover:border-gold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status.submitting}
                    className="flex-1 bg-gold text-ink font-semibold py-3 rounded-lg text-sm hover:brightness-110 transition disabled:opacity-60"
                  >
                    {status.submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
      </Modal>
    </section>
  );
}
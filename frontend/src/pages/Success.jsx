import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";

export default function Success() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) return;
    // Poll briefly since the webhook may take a second or two to fire
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await api.get(`/orders/session/${sessionId}`);
        setOrder(res.data);
        if (res.data.status === "pending" && attempts < 6) {
          attempts += 1;
          setTimeout(poll, 2000);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    poll();
  }, [sessionId]);

  return (
    <div className="container-px max-w-xl mx-auto py-24 text-center">
      <Seo title="Payment Confirmed | Vaultly" description="Your payment was successful." noindex />
      <div className="w-16 h-16 rounded-full bg-teal/10 border border-teal/40 flex items-center justify-center mx-auto mb-6">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="font-display font-700 text-3xl mb-3">Payment confirmed</h1>
      {loading ? (
        <Loader label="Sending your product to your inbox..." />
      ) : order ? (
        <p className="text-text-muted mb-8">
          We've emailed <span className="text-text-primary">{order.productTitle}</span> to{" "}
          <span className="text-gold">{order.customerEmail}</span>. Check your inbox (and spam folder, just in case).
        </p>
      ) : (
        <p className="text-text-muted mb-8">Your payment was successful. Check your email for the download link.</p>
      )}
      <Link to="/products?continue=1" className="inline-block bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition">
        Continue Shopping
      </Link>
    </div>
  );
}

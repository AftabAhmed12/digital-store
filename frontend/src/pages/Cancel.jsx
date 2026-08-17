import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Seo from "../components/Seo.jsx";

export default function Cancel() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      api.post("/orders/cancel", { sessionId }).catch(() => {});
    }
  }, [sessionId]);

  return (
    <div className="container-px max-w-xl mx-auto py-24 text-center">
      <Seo title="Checkout Cancelled | Vaultly" description="Your checkout was cancelled." noindex />
      <h1 className="font-display font-700 text-3xl mb-3">Checkout cancelled</h1>
      <p className="text-text-muted mb-8">No worries — no payment was made. You can pick up where you left off anytime.</p>
      <Link to="/products?continue=1" className="inline-block bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition">
        Back to Products
      </Link>
    </div>
  );
}
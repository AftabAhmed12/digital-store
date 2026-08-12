import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setFeatured(res.data.slice(0, 6)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(242,184,75,0.08),transparent_40%),radial-gradient(circle_at_80%_60%,rgba(91,141,239,0.10),transparent_45%)]" />
        <div className="container-px max-w-7xl mx-auto relative py-24 md:py-32">
          <p className="text-gold text-xs uppercase tracking-[3px] font-semibold mb-4">No login. No waiting.</p>
          <h1 className="font-display font-700 text-4xl md:text-6xl leading-tight max-w-2xl mb-6">
            Pay once. Your product lands in your inbox <span className="text-gold">instantly.</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl mb-8">
            Vaultly sells digital products the way they should be sold — pick it, pay for it,
            and get it emailed to you in seconds. No accounts, no dashboards, no friction.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/products" className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition">
              Browse Products
            </Link>
            <Link to="/blog" className="border border-border text-text-primary font-semibold px-6 py-3 rounded-lg hover:border-teal transition">
              Read the Blog
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-px max-w-7xl mx-auto py-20">
        <h2 className="font-display font-600 text-2xl md:text-3xl mb-10">How buying works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "Choose", desc: "Browse the catalog and pick the product you need. No account required.", color: "text-gold" },
            { step: "Pay", desc: "Checkout securely with Stripe — cards, Apple Pay, Google Pay, all supported.", color: "text-teal" },
            { step: "Receive", desc: "The moment payment clears, your download link is emailed to you automatically.", color: "text-blue" },
          ].map((item, i) => (
            <div key={item.step} className="bg-surface border border-border rounded-xl p-6">
              <p className={`font-mono text-sm mb-3 ${item.color}`}>0{i + 1}</p>
              <h3 className="font-display font-600 text-lg mb-2">{item.step}</h3>
              <p className="text-text-faint text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="container-px max-w-7xl mx-auto py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display font-600 text-2xl md:text-3xl">Featured products</h2>
          <Link to="/products" className="text-sm text-gold hover:underline">View all →</Link>
        </div>
        {loading ? (
          <Loader />
        ) : featured.length === 0 ? (
          <p className="text-text-faint">No products yet — check back soon.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

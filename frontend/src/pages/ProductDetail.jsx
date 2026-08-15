import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import ProductGallery from "../components/ProductGallery.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import ProductShare from "../components/ProductShare.jsx";

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Keep social-share preview tags in sync with the product (used by FB/LinkedIn/WhatsApp previews)
  useEffect(() => {
    if (!product) return;
    const setMeta = (attr, key, value) => {
      const tag = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (tag) tag.setAttribute("content", value);
    };
    const desc = product.shortDescription || product.description;
    const blurb = (typeof desc === "string" ? desc : "").slice(0, 180);
    setMeta("property", "og:title", product.title);
    setMeta("property", "og:description", blurb);
    setMeta("property", "og:url", window.location.href);
    setMeta("name", "twitter:title", product.title);
    setMeta("name", "twitter:description", blurb);
    if (product.images?.[0]?.url) {
      setMeta("property", "og:image", product.images[0].url);
      setMeta("name", "twitter:image", product.images[0].url);
    }
  }, [product]);

  const handleBuy = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/orders/checkout", { productId: product._id, customerEmail: email });
      window.location.href = res.data.url; // redirect to Stripe Checkout
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !product) return <div className="container-px max-w-3xl mx-auto py-24 text-center text-text-faint">{error}</div>;
  if (!product) return null;

  return (
    <div className="container-px max-w-6xl mx-auto py-16 grid md:grid-cols-2 gap-12">
      <ProductGallery images={product.images} title={product.title} />

      <div>
        <p className="text-xs uppercase tracking-widest text-teal mb-2">{product.category}</p>
        <h1 className="font-display font-700 text-3xl md:text-4xl mb-4">{product.title}</h1>
        <p className="text-text-muted leading-relaxed mb-6">{product.description}</p>

<div className="flex items-baseline gap-2 mb-6">
          <span className="font-mono text-gold text-3xl">
            {product.currency?.toUpperCase()} {product.price?.toFixed(2)}
          </span>
          <span className="text-text-faint text-sm">one-time payment</span>
        </div>

        <ProductShare product={product} />

        <form onSubmit={handleBuy} className="bg-surface border border-border rounded-xl p-6 space-y-4 mt-6">
          <div>
            <label className="block text-sm text-text-muted mb-2">Your email (for delivery)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sarah.mitchell@gmail.com"
              className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60"
          >
            {submitting ? "Redirecting to checkout..." : `Buy Now — ${product.currency?.toUpperCase()} ${product.price?.toFixed(2)}`}
          </button>
          <p className="text-xs text-text-faint text-center">
            Secure checkout via Stripe. Your product will be emailed instantly after payment.
          </p>
        </form>
      </div>

      <div className="md:col-span-2">
        <ProductReviews product={product} />
      </div>
    </div>
  );
}

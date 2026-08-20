import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import ProductGallery from "../components/ProductGallery.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import ProductShare from "../components/ProductShare.jsx";
import Seo from "../components/Seo.jsx";

// Lazy-loaded on its own so the extra fetch + cards don't ship with the product page.
const RelatedProducts = lazy(() => import("../components/RelatedProducts.jsx"));

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState(null); // { code, discount, ... } when applied
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/products/${slug}`)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Product not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  // Browsers restore this page from the back/forward cache (bfcache) when a
  // user hits Back from Stripe Checkout without paying — the JS state comes
  // back exactly as-is, so `submitting` stays stuck on "Redirecting to
  // checkout..." forever. Reset it so the buy button works again.
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted) {
        setSubmitting(false);
        setError("");
        setCouponLoading(false);
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const seo = useMemo(() => {
    if (!product) return { title: null, description: null, image: null, jsonLd: null };
    const desc = (product.shortDescription || product.description || "").slice(0, 180);
    const origin = window.location.origin;
    const url = `${origin}/products/${product.slug}`;
    const image = product.images?.[0]?.url;
    return {
      title: `${product.title} — Instant Download | Vaultly`,
      description: desc,
      image,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: desc,
          image,
          brand: { "@type": "Brand", name: "Vaultly" },
          offers: {
            "@type": "Offer",
            url,
            price: product.price,
            priceCurrency: (product.currency || "usd").toUpperCase(),
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Products", item: `${origin}/products` },
            { "@type": "ListItem", position: 2, name: product.title, item: url },
          ],
        },
      ],
    };
  }, [product]);

  const discountPercent = Number(product?.discountPercent) || 0;
  const salePrice = product ? (discountPercent > 0 ? product.price * (1 - discountPercent / 100) : product.price) : 0;
  const finalPrice = coupon ? Math.max(salePrice - coupon.discount, 0) : salePrice;

  const applyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError("");
    setCouponLoading(true);
    try {
      const res = await api.post("/coupons/validate", { code, productId: product._id });
      setCoupon(res.data);
      setCouponInput("");
    } catch (err) {
      setCouponError(err.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/orders/checkout", {
        productId: product._id,
        customerEmail: email,
        couponCode: coupon?.code,
      });
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
      <Seo title={seo.title} description={seo.description} image={seo.image} jsonLd={seo.jsonLd} />
      <ProductGallery images={product.images} title={product.title} />

      <div>
        <Link
          to={`/products?category=${encodeURIComponent(product.category)}`}
          className="text-xs uppercase tracking-widest text-teal mb-2 inline-block hover:underline hover:text-gold transition-colors"
        >
          {product.category}
        </Link>
        <h1 className="font-display font-700 text-3xl md:text-4xl mb-4">{product.title}</h1>

        {product.description.length > 300 && (
          <div className="mb-6">
            <div
              className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
                descExpanded ? "max-h-[3000px]" : "max-h-28"
              }`}
            >
              <p className={`text-text-muted leading-relaxed ${descExpanded ? "" : "line-clamp-4"}`}>
                {product.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-2 text-sm font-medium text-gold hover:underline inline-flex items-center gap-1 transition-colors"
            >
              {descExpanded ? "Show Less" : "Show More"}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={`transition-transform duration-300 ${descExpanded ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        )}

        {product.description.length <= 300 && (
          <p className="text-text-muted leading-relaxed mb-6">{product.description}</p>
        )}

<div className="flex items-baseline gap-3 mb-6 flex-wrap">
          <span className="font-mono text-gold text-3xl">
            {product.currency?.toUpperCase()} {finalPrice.toFixed(2)}
          </span>
          {discountPercent > 0 && (
            <>
              <span className="font-mono text-text-faint text-xl line-through">
                {product.currency?.toUpperCase()} {product.price.toFixed(2)}
              </span>
              <span className="text-xs bg-gold/15 text-gold font-bold px-2 py-1 rounded-md">
                {Math.round(discountPercent)}% OFF
              </span>
            </>
          )}
          {coupon && (
            <span className="text-xs bg-teal/15 text-teal font-semibold px-2 py-1 rounded-md">
              − {product.currency?.toUpperCase()} {coupon.discount.toFixed(2)}
            </span>
          )}
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

          {!coupon ? (
            <div>
              <label className="block text-sm text-text-muted mb-2">Coupon code (optional)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="e.g. VAULT10"
                  className="flex-1 bg-ink border border-border rounded-lg px-4 py-3 text-sm uppercase focus:border-gold outline-none min-w-0"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="bg-surface2 border border-border text-text-primary text-sm font-medium px-4 py-3 rounded-lg hover:border-gold/60 transition disabled:opacity-50"
                >
                  {couponLoading ? "Checking..." : "Apply"}
                </button>
              </div>
              {couponError && <p className="text-red-400 text-sm mt-2">{couponError}</p>}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-teal/10 border border-teal/30 rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-teal">
                  Coupon {coupon.code} applied — {coupon.type === "percent" ? `${coupon.value}% off` : `${coupon.value.toFixed(2)} ${product.currency?.toUpperCase()} off`}
                </p>
                <p className="text-xs text-text-faint mt-0.5">
                  You save {product.currency?.toUpperCase()} {coupon.discount.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCoupon(null)}
                className="text-xs text-text-faint hover:text-red-400 underline transition-colors shrink-0"
              >
                Remove
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60"
          >
            {submitting ? "Redirecting to checkout..." : `Buy Now — ${product.currency?.toUpperCase()} ${finalPrice.toFixed(2)}`}
          </button>
          <p className="text-xs text-text-faint text-center">
            Secure checkout via Stripe. Your product will be emailed instantly after payment.
          </p>
        </form>
      </div>

      <div className="md:col-span-2">
        <ProductReviews product={product} />
      </div>

      <div className="md:col-span-2">
        <Suspense fallback={null}>
          <RelatedProducts category={product.category} slug={product.slug} />
        </Suspense>
      </div>
    </div>
  );
}

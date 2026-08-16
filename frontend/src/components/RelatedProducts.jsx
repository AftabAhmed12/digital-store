import { useEffect, useState } from "react";
import api from "../api/axios.js";
import ProductCard from "./ProductCard.jsx";

// "You Might Also Like" — top 5 products from the same category, ranked by
// average approved rating. Styled like the social-links card (soft blurred
// glow blobs on a bordered surface panel). On laptop/desktop the five cards
// fit in a single compact row (compact cards, one row on lg+).
// Re-fetches whenever the product slug changes, so clicking a card navigates
// to that product and the list updates to show the best-rated remaining
// products (the current one is always excluded).
export default function RelatedProducts({ category, slug }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/products/${slug}/related`)
      .then((res) => {
        if (active) setItems(res.data);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading || items.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border bg-surface py-12 px-4 md:px-6 text-center">
      <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl" />

      <div className="relative">
        <p className="text-gold text-xs uppercase tracking-[3px] font-semibold mb-3 capitalize">
          Top rated in {category}
        </p>
        <h2 className="font-display font-700 text-2xl md:text-3xl mb-8">
          You Might Also <span className="text-gold">Like</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 text-left">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
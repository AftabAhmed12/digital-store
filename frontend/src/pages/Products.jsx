import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";

const PAGE_SIZE = 12;

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve the starting filters synchronously during render, so the very first
  // fetch is already filtered. When arriving via "Continue Shopping" (?continue=1)
  // the saved category/search from the last browse session are pulled in here —
  // an effect-based restore leaks an unfiltered fetch under React StrictMode.
  const [initialFilters] = useState(() => {
    const sp = new URLSearchParams(window.location.search);
    if (sp.get("continue") === "1") {
      sp.delete("continue");
      if (!sp.get("category") && !sp.get("search")) {
        const saved = JSON.parse(sessionStorage.getItem("vaultly:products-filters") || "null");
        if (saved?.category) sp.set("category", saved.category);
        if (saved?.search) sp.set("search", saved.search);
      }
    }
    return sp;
  });

  const initedRef = useRef(false);
  const activeCategory = initedRef.current
    ? searchParams.get("category") || ""
    : searchParams.get("category") || initialFilters.get("category") || "";
  const search = initedRef.current
    ? searchParams.get("search") || ""
    : searchParams.get("search") || initialFilters.get("search") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  // After mount, searchParams is the single source of truth. Also sync the URL
  // to the effective filters (drops ?continue, applies any restored filters).
  useEffect(() => {
    initedRef.current = true;
    const current = new URLSearchParams(window.location.search);
    const desired = initialFilters;
    if (current.toString() !== desired.toString()) {
      setSearchParams(desired, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  // Category select pushes a new history entry (back button switches category),
  // while typing in search replaces so every keystroke doesn't bloat history.
  const handleCategory = (cat) => {
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (search.trim()) params.set("search", search);
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (value) params.set("search", value);
    setSearchParams(params, { replace: true });
  };

  // Remember the filters so "Continue Shopping" can restore them after checkout.
  useEffect(() => {
    sessionStorage.setItem(
      "vaultly:products-filters",
      JSON.stringify({ category: activeCategory, search })
    );
  }, [activeCategory, search]);

  // First page — resets whenever the filters change.
  useEffect(() => {
    setLoading(true);
    pageRef.current = 1;
    const params = { page: 1, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api
      .get("/products", { params })
      .then((res) => {
        setProducts(res.data.data);
        setHasMore(res.data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const showMore = () => {
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);
    const params = { page: nextPage, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api
      .get("/products", { params })
      .then((res) => {
        setProducts((prev) => [...prev, ...res.data.data]);
        setHasMore(res.data.hasMore);
        pageRef.current = nextPage;
      })
      .finally(() => setLoadingMore(false));
  };

  const catalogJsonLd = useMemo(() => {
    const origin = window.location.origin;
    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "All Products",
        url: `${origin}/products`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${origin}/products/${p.slug}`,
            name: p.title,
          })),
        },
      },
    ];
  }, [products]);

  return (
    <div className="container-px max-w-7xl mx-auto py-16">
      <Seo
        title="All Products — Buy Digital Downloads Instantly | Vaultly"
        description="Browse fonts, templates, UI kits and more. Instant download delivered to your inbox after payment — no account needed."
        jsonLd={catalogJsonLd}
      />
      <h1 className="font-display font-700 text-3xl md:text-4xl mb-3">All Products</h1>
      <p className="text-text-faint mb-10">Browse the catalog — every purchase is delivered by email instantly.</p>

      <div className="flex flex-col md:flex-row gap-4 mb-10">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={handleSearch}
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm w-full md:w-72 focus:border-gold outline-none"
        />
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={handleCategory}
          label="All Categories"
        />
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-text-faint py-20 text-center">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} compact />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={showMore}
                disabled={loadingMore}
                className="bg-surface border border-border text-text-primary font-semibold px-8 py-3 rounded-lg hover:border-gold hover:text-gold transition-colors disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <span className="w-4 h-4 border-2 border-border border-t-gold rounded-full animate-spin" />
                    Loading…
                  </>
                ) : (
                  "Show more"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

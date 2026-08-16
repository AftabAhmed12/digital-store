import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    api
      .get("/products", { params })
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

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
          onChange={(e) => setSearch(e.target.value)}
          className="bg-surface border border-border rounded-lg px-4 py-2.5 text-sm w-full md:w-72 focus:border-gold outline-none"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("")}
            className={`px-4 py-2 rounded-lg text-sm border ${
              activeCategory === "" ? "bg-gold text-ink border-gold" : "border-border text-text-muted hover:border-teal"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm border capitalize ${
                activeCategory === cat ? "bg-gold text-ink border-gold" : "border-border text-text-muted hover:border-teal"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-text-faint py-20 text-center">No products found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

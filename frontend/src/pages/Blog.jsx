import { useEffect, useMemo, useRef, useState } from "react";
import api from "../api/axios.js";
import BlogCard from "../components/BlogCard.jsx";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";
import CategoryFilter from "../components/CategoryFilter.jsx";

const PAGE_SIZE = 9;

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageRef = useRef(1);

  useEffect(() => {
    api.get("/blogs/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    pageRef.current = 1;
    const params = { page: 1, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    api
      .get("/blogs", { params })
      .then((res) => {
        setBlogs(res.data.data);
        setHasMore(res.data.hasMore);
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const showMore = () => {
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);
    const params = { page: nextPage, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    api
      .get("/blogs", { params })
      .then((res) => {
        setBlogs((prev) => [...prev, ...res.data.data]);
        setHasMore(res.data.hasMore);
        pageRef.current = nextPage;
      })
      .finally(() => setLoadingMore(false));
  };

  const blogListJsonLd = useMemo(() => {
    const origin = window.location.origin;
    return [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Vaultly Blog",
        url: `${origin}/blog`,
        blogPost: blogs.map((b) => ({
          "@type": "BlogPosting",
          headline: b.title,
          url: `${origin}/blog/${b.slug}`,
          datePublished: b.createdAt,
          author: { "@type": "Person", name: b.author || "Vaultly" },
        })),
      },
    ];
  }, [blogs]);

  return (
    <div className="container-px max-w-7xl mx-auto py-16">
      <Seo
        title="Blog — Digital Product Guides & Updates | Vaultly"
        description="Guides, tips and updates on fonts, templates, UI kits and design workflows — organized by category."
        jsonLd={blogListJsonLd}
      />
      <h1 className="font-display font-700 text-3xl md:text-4xl mb-3">Blog</h1>
      <p className="text-text-faint mb-10">Guides, updates, and insights — organized by category.</p>

      <div className="mb-10">
        <CategoryFilter
          categories={categories}
          active={activeCategory}
          onChange={setActiveCategory}
          label="All Categories"
        />
      </div>

      {loading ? (
        <Loader />
      ) : blogs.length === 0 ? (
        <p className="text-text-faint py-20 text-center">No blog posts yet.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((b) => (
              <BlogCard key={b._id} blog={b} />
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

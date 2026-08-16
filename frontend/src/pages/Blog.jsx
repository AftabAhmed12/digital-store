import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import BlogCard from "../components/BlogCard.jsx";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/blogs/categories").then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeCategory ? { category: activeCategory } : {};
    api
      .get("/blogs", { params })
      .then((res) => setBlogs(res.data))
      .finally(() => setLoading(false));
  }, [activeCategory]);

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

      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            activeCategory === "" ? "bg-teal text-ink border-teal" : "border-border text-text-muted hover:border-teal"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm border capitalize ${
              activeCategory === cat ? "bg-teal text-ink border-teal" : "border-border text-text-muted hover:border-teal"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : blogs.length === 0 ? (
        <p className="text-text-faint py-20 text-center">No blog posts yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((b) => (
            <BlogCard key={b._id} blog={b} />
          ))}
        </div>
      )}
    </div>
  );
}

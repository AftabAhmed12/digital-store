import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import Seo from "../components/Seo.jsx";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get(`/blogs/${slug}`)
      .then((res) => setBlog(res.data))
      .catch(() => setError("Post not found"))
      .finally(() => setLoading(false));
  }, [slug]);

  const seo = useMemo(() => {
    if (!blog) return { title: null, description: null, image: null, jsonLd: null };
    const origin = window.location.origin;
    const url = `${origin}/blog/${blog.slug}`;
    const author = blog.author || "Vaultly";
    return {
      title: `${blog.title} — Vaultly Blog`,
      description: (blog.excerpt || "").slice(0, 180),
      image: blog.coverImage?.url,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          description: blog.excerpt,
          image: blog.coverImage?.url,
          datePublished: blog.createdAt,
          author: { "@type": "Person", name: author },
          publisher: { "@type": "Organization", name: "Vaultly" },
          mainEntityOfPage: url,
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Blog", item: `${origin}/blog` },
            { "@type": "ListItem", position: 2, name: blog.title, item: url },
          ],
        },
      ],
    };
  }, [blog]);

  if (loading) return <Loader />;
  if (error) return <div className="container-px max-w-3xl mx-auto py-24 text-center text-text-faint">{error}</div>;
  if (!blog) return null;

  return (
    <article className="container-px max-w-3xl mx-auto py-16">
      <Seo title={seo.title} description={seo.description} image={seo.image} jsonLd={seo.jsonLd} />
      <Link to="/blog" className="text-sm text-gold hover:underline">← Back to Blog</Link>
      <p className="text-xs uppercase tracking-widest text-teal mt-6 mb-2">{blog.category}</p>
      <h1 className="font-display font-700 text-3xl md:text-4xl mb-4">{blog.title}</h1>
      <p className="text-text-faint text-sm mb-8">
        By {blog.author} · {new Date(blog.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
      </p>
      {blog.coverImage?.url && (
        <img src={blog.coverImage.url} alt={blog.title} loading="lazy" decoding="async" className="w-full rounded-xl mb-8 border border-border" />
      )}
      <div
        className="prose prose-invert max-w-none text-text-muted leading-relaxed"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
}

import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-surface border border-border rounded-xl overflow-hidden hover:border-teal/50 transition-colors"
    >
      <div className="aspect-[16/9] overflow-hidden bg-surface2">
        {blog.coverImage?.url ? (
          <img
            src={blog.coverImage.url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-faint text-sm">
            No image
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-teal mb-2">{blog.category}</p>
        <h3 className="font-display font-600 text-lg mb-2 group-hover:text-gold transition-colors line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-text-faint text-sm line-clamp-2 mb-3">{blog.excerpt}</p>
        <p className="text-xs text-text-faint">
          {new Date(blog.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
        </p>
      </div>
    </Link>
  );
}

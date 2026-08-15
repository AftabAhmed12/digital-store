// Clickable product title for admin tables — opens the public product page in a
// new tab. Falls back to plain text if the product link is unavailable.
export default function ProductTitleLink({ slug, title }) {
  if (!slug) return <span className="font-semibold">{title}</span>;
  return (
    <a
      href={`/products/${slug}`}
      target="_blank"
      rel="noreferrer"
      title="Open product page in new tab"
      className="font-semibold text-blue hover:underline"
    >
      {title}
    </a>
  );
}
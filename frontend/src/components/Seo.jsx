import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Vaultly — Digital Products, Delivered Instantly";
const DEFAULT_DESC =
  "Buy digital products instantly — no account needed. Delivered straight to your inbox.";

const setMeta = (attr, key, value) => {
  const tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (tag) tag.setAttribute("content", value);
};

// Lightweight per-page SEO manager: updates title, description, canonical,
// social preview tags and injects JSON-LD structured data. Cleans up on change.
export default function Seo({ title, description, image, noindex, jsonLd }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonical = `${window.location.origin}${pathname}`;
    const fullTitle = title || DEFAULT_TITLE;
    const fullDesc = description || DEFAULT_DESC;

    document.title = fullTitle;
    setMeta("name", "description", fullDesc);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", fullDesc);
    setMeta("property", "og:url", canonical);
    setMeta("property", "og:type", "website");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", fullDesc);
    if (image) {
      setMeta("property", "og:image", image);
      setMeta("name", "twitter:image", image);
    }

    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonical);

    let robots = document.head.querySelector('meta[name="robots"]');
    if (noindex) {
      if (!robots) {
        robots = document.createElement("meta");
        robots.setAttribute("name", "robots");
        document.head.appendChild(robots);
      }
      robots.setAttribute("content", "noindex, nofollow");
    } else if (robots) {
      robots.setAttribute("content", "index, follow");
    }

    // JSON-LD structured data — clear any previous page's scripts, then add ours.
    // Cleanup removes only our own script so navigation never leaks stale schema.
    document.querySelectorAll('script[data-seo-jsonld]').forEach((s) => s.remove());
    let ownScript = null;
    if (jsonLd) {
      ownScript = document.createElement("script");
      ownScript.type = "application/ld+json";
      ownScript.setAttribute("data-seo-jsonld", "true");
      ownScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(ownScript);
    }
    return () => {
      ownScript?.remove();
    };
  }, [pathname, title, description, image, noindex, jsonLd]);

  return null;
}
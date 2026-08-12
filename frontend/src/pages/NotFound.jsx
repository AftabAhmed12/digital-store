import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container-px max-w-xl mx-auto py-32 text-center">
      <p className="font-mono text-gold text-sm mb-4">404</p>
      <h1 className="font-display font-700 text-3xl mb-3">Page not found</h1>
      <p className="text-text-muted mb-8">The page you're looking for doesn't exist or was moved.</p>
      <Link to="/" className="inline-block bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition">
        Go Home
      </Link>
    </div>
  );
}

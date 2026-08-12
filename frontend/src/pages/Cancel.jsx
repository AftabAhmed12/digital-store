import { Link } from "react-router-dom";

export default function Cancel() {
  return (
    <div className="container-px max-w-xl mx-auto py-24 text-center">
      <h1 className="font-display font-700 text-3xl mb-3">Checkout cancelled</h1>
      <p className="text-text-muted mb-8">No worries — no payment was made. You can pick up where you left off anytime.</p>
      <Link to="/products" className="inline-block bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 transition">
        Back to Products
      </Link>
    </div>
  );
}

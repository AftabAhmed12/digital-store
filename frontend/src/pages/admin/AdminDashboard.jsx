import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/orders/admin/all"),
      api.get("/products/admin/all"),
      api.get("/blogs/admin/all"),
    ]).then(([orders, products, blogs]) => {
      const paidOrders = orders.data.filter((o) => o.status === "email_sent" || o.status === "paid");
      const revenue = paidOrders.reduce((sum, o) => sum + o.amount, 0) / 100;
      setStats({
        totalOrders: orders.data.length,
        paidOrders: paidOrders.length,
        revenue,
        totalProducts: products.data.length,
        totalBlogs: blogs.data.length,
        recentOrders: orders.data.slice(0, 5),
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  const cards = [
    { label: "Total Revenue", value: `$${stats.revenue.toFixed(2)}`, color: "text-gold" },
    { label: "Paid Orders", value: stats.paidOrders, color: "text-teal" },
    { label: "Products", value: stats.totalProducts, color: "text-blue" },
    { label: "Blog Posts", value: stats.totalBlogs, color: "text-text-primary" },
  ];

  return (
    <div className="container-px py-10 max-w-6xl">
      <h1 className="font-display font-700 text-2xl mb-8">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-surface border border-border rounded-xl p-5">
            <p className="text-text-faint text-xs uppercase tracking-widest mb-2">{c.label}</p>
            <p className={`font-display font-700 text-2xl ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display font-600 text-lg mb-4">Recent Orders</h2>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Product</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.map((o) => (
              <tr key={o._id} className="border-b border-border last:border-0">
                <td className="p-4">{o.productTitle}</td>
                <td className="p-4 text-text-muted">{o.customerEmail}</td>
                <td className="p-4 font-mono">${(o.amount / 100).toFixed(2)}</td>
                <td className="p-4"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-500/10 text-yellow-400",
    paid: "bg-blue-500/10 text-blue-400",
    email_sent: "bg-teal/10 text-teal",
    email_failed: "bg-red-500/10 text-red-400",
    failed: "bg-red-500/10 text-red-400",
    cancelled: "bg-yellow-500/10 text-yellow-400",
  };
  return <span className={`px-2 py-1 rounded text-xs ${map[status] || ""}`}>{status}</span>;
}

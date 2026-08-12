import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admin/login", form);
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminName", res.data.name);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink container-px">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-surface border border-border rounded-xl p-8">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="font-display font-700 text-lg">Vaultly Admin</span>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </form>
    </div>
  );
}

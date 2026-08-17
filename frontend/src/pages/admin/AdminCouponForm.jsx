import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminCouponForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    code: "", type: "percent", value: "", appliesToAll: false,
    products: [], appliesToCategories: [], minAmount: "", maxUses: "", expiresAt: "", isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/products/admin/all", { params: { page: 1, limit: 10000 } }),
      isEdit ? api.get("/coupons/admin/all", { params: { page: 1, limit: 10000 } }) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([prodRes, couponRes]) => {
        setProducts(prodRes.data.data);
        if (isEdit) {
          const c = couponRes.data.data.find((x) => x._id === id);
          if (c) {
            setForm({
              code: c.code,
              type: c.type || "percent",
              value: c.value ?? "",
              appliesToAll: Boolean(c.appliesToAll),
              products: (c.products || []).map((p) => p._id),
              appliesToCategories: c.appliesToCategories || [],
              minAmount: c.minAmount ?? "",
              maxUses: c.maxUses ?? "",
              expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 10) : "",
              isActive: Boolean(c.isActive),
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleProduct = (productId) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((p) => p !== productId)
        : [...prev.products, productId],
    }));
  };

  const toggleCategory = (category) => {
    setForm((prev) => ({
      ...prev,
      appliesToCategories: prev.appliesToCategories.includes(category)
        ? prev.appliesToCategories.filter((c) => c !== category)
        : [...prev.appliesToCategories, category],
    }));
  };

  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );

  const [search, setSearch] = useState("");
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.title.toLowerCase().includes(q));
  }, [products, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        code: form.code,
        type: form.type,
        value: form.value,
        appliesToAll: form.appliesToAll,
        products: form.appliesToAll ? [] : form.products,
        appliesToCategories: form.appliesToAll ? [] : form.appliesToCategories,
        minAmount: form.minAmount,
        maxUses: form.maxUses,
        expiresAt: form.expiresAt,
        isActive: form.isActive,
      };
      if (isEdit) {
        await api.put(`/coupons/admin/${id}`, payload);
      } else {
        await api.post("/coupons/admin", payload);
      }
      navigate("/admin/coupons");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="font-display font-700 text-2xl mb-8">{isEdit ? "Edit Coupon" : "New Coupon"}</h1>
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <Field label="Coupon code (customers type this — shown uppercase)">
          <input name="code" required value={form.code} onChange={handleChange} placeholder="e.g. VAULT10" className="input uppercase" />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Discount type">
            <select name="type" value={form.type} onChange={handleChange} className="input">
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount ($)</option>
            </select>
          </Field>
          <Field label={form.type === "percent" ? "Value (%)" : "Value (USD)"}>
            <input type="number" step={form.type === "percent" ? "1" : "0.01"} min="0" name="value" required value={form.value} onChange={handleChange} className="input" />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Minimum order (USD, 0 = none)">
            <input type="number" step="0.01" min="0" name="minAmount" value={form.minAmount} onChange={handleChange} className="input" />
          </Field>
          <Field label="Max uses (empty = unlimited)">
            <input type="number" step="1" min="1" name="maxUses" value={form.maxUses} onChange={handleChange} className="input" />
          </Field>
        </div>

        <Field label="Expires on (optional)">
          <input type="date" name="expiresAt" value={form.expiresAt} onChange={handleChange} className="input" />
        </Field>

        <div className="pt-2 border-t border-border">
          <label className="flex items-center gap-2 text-sm text-text-muted mb-3">
            <input type="checkbox" name="appliesToAll" checked={form.appliesToAll} onChange={handleChange} />
            Applies to all products
          </label>

          {!form.appliesToAll && (
            <>
              <Field label={`Select categories (${form.appliesToCategories.length} selected) — the code works on these whole categories`}>
                <div className="dropdown-scroll max-h-40 overflow-y-auto bg-ink border border-border rounded-lg divide-y divide-border mb-4">
                  {allCategories.length === 0 && (
                    <p className="p-4 text-sm text-text-faint text-center">No categories yet.</p>
                  )}
                  {allCategories.map((cat) => {
                    const checked = form.appliesToCategories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-surface2 capitalize ${
                          checked ? "bg-surface2" : ""
                        }`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleCategory(cat)} className="accent-current" />
                        <span className="flex-1">{cat}</span>
                      </label>
                    );
                  })}
                </div>
              </Field>

              <Field label={`Select products (${form.products.length} selected) — a coupon can apply to many products`}>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input mb-3"
                />
                <div className="dropdown-scroll max-h-52 overflow-y-auto bg-ink border border-border rounded-lg divide-y divide-border">
                  {filteredProducts.length === 0 && (
                    <p className="p-4 text-sm text-text-faint text-center">No products found.</p>
                  )}
                  {filteredProducts.map((p) => {
                    const checked = form.products.includes(p._id);
                    return (
                      <label
                        key={p._id}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-surface2 ${
                          checked ? "bg-surface2" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleProduct(p._id)}
                          className="accent-current"
                        />
                        <span className="flex-1 min-w-0 truncate">{p.title}</span>
                        <span className="text-xs text-text-faint font-mono shrink-0">
                          ${Number(p.price).toFixed(2)}
                          {Number(p.discountPercent) > 0 && (
                            <span className="text-gold ml-1">{Math.round(p.discountPercent)}% off</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </Field>
            </>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Active (can be redeemed)
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 disabled:opacity-60">
          {saving ? "Saving..." : "Save Coupon"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-text-muted mb-2">{label}</label>
      {children}
    </div>
  );
}
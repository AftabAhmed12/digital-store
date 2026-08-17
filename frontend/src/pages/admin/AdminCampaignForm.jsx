import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function AdminCampaignForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    title: "", couponCode: "", discountType: "percent", discountValue: "",
    appliesToAll: false, categories: [], products: [], endsAt: "", isActive: true,
  });
  const [posterFile, setPosterFile] = useState(null);
  const [existingPoster, setExistingPoster] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/products/admin/all", { params: { page: 1, limit: 10000 } }),
      isEdit ? api.get("/campaigns/admin/all", { params: { page: 1, limit: 10000 } }) : Promise.resolve({ data: { data: [] } }),
    ])
      .then(([prodRes, campRes]) => {
        setProducts(prodRes.data.data);
        if (isEdit) {
          const c = campRes.data.data.find((x) => x._id === id);
          if (c) {
            setForm({
              title: c.title,
              couponCode: c.coupon?.code || "",
              discountType: c.coupon?.type || "percent",
              discountValue: c.coupon?.value ?? "",
              appliesToAll: Boolean(c.coupon?.appliesToAll),
              categories: c.coupon?.appliesToCategories || [],
              products: (c.coupon?.products || []).map((p) => p._id),
              endsAt: c.coupon?.expiresAt ? new Date(c.coupon.expiresAt).toISOString().slice(0, 10) : "",
              isActive: Boolean(c.isActive),
            });
            setExistingPoster(c.posterImage || null);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const toggleCategory = (cat) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleProduct = (productId) => {
    setForm((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((p) => p !== productId)
        : [...prev.products, productId],
    }));
  };

  const [search, setSearch] = useState("");
  const allCategories = useMemo(
    () => [...new Set(products.map((p) => p.category).filter(Boolean))].sort(),
    [products]
  );
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
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("couponCode", form.couponCode);
      fd.append("discountType", form.discountType);
      fd.append("discountValue", form.discountValue);
      fd.append("appliesToAll", form.appliesToAll ? "true" : "false");
      fd.append("products", JSON.stringify(form.appliesToAll ? [] : form.products));
      fd.append("categories", JSON.stringify(form.appliesToAll ? [] : form.categories));
      fd.append("endsAt", form.endsAt);
      fd.append("isActive", form.isActive ? "true" : "false");
      if (posterFile) fd.append("posterImage", posterFile);

      if (isEdit) {
        await api.put(`/campaigns/admin/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        if (!posterFile) throw new Error("Campaign poster is required");
        await api.post("/campaigns/admin", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin/campaigns");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save campaign");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="font-display font-700 text-2xl mb-8">{isEdit ? "Edit Campaign" : "New Campaign"}</h1>
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <Field label="Campaign title (e.g. Father's Day Sale)">
          <input name="title" required value={form.title} onChange={handleChange} className="input" />
        </Field>

        <Field label="Poster image (the code & campaign details go inside the image)">
          <input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files[0] || null)} className="input" />
          {(existingPoster?.url || posterFile) && (
            <div className="mt-3">
              <img
                src={posterFile ? URL.createObjectURL(posterFile) : existingPoster.url}
                alt="Poster preview"
                className="w-full max-h-44 object-cover rounded-lg border border-border"
              />
              {!posterFile && isEdit && (
                <p className="text-xs text-text-faint mt-2">Current poster — upload a new one to replace it.</p>
              )}
            </div>
          )}
        </Field>

        <div className="pt-2 border-t border-border">
          <Field label="Coupon code (customers use this at checkout — shown uppercase)">
            <input name="couponCode" required value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })} placeholder="e.g. FATHERSDAY" className="input uppercase" />
          </Field>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field label="Discount type">
              <select name="discountType" value={form.discountType} onChange={handleChange} className="input">
                <option value="percent">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </Field>
            <Field label={form.discountType === "percent" ? "Value (%)" : "Value (USD)"}>
              <input type="number" step={form.discountType === "percent" ? "1" : "0.01"} min="0" name="discountValue" required value={form.discountValue} onChange={handleChange} className="input" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field label="Campaign end date (coupon valid until this date)">
              <input type="date" name="endsAt" value={form.endsAt} onChange={handleChange} className="input" />
            </Field>
            <Field label="Active">
              <label className="flex items-center gap-2 text-sm text-text-muted pt-3">
                <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
                Show this campaign
              </label>
            </Field>
          </div>

          <div className="mt-5 pt-5 border-t border-border">
            <label className="flex items-center gap-2 text-sm text-text-muted mb-3">
              <input type="checkbox" name="appliesToAll" checked={form.appliesToAll} onChange={handleChange} />
              Coupon applies to all products
            </label>

            {!form.appliesToAll && (
              <>
                <Field label={`Categories (${form.categories.length} selected) — code works on these whole categories`}>
                  <div className="dropdown-scroll max-h-40 overflow-y-auto bg-ink border border-border rounded-lg divide-y divide-border mb-4">
                    {allCategories.length === 0 && (
                      <p className="p-4 text-sm text-text-faint text-center">No categories yet.</p>
                    )}
                    {allCategories.map((cat) => {
                      const checked = form.categories.includes(cat);
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

                <Field label={`Specific products (${form.products.length} selected) — code also works on these`}>
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
                          <input type="checkbox" checked={checked} onChange={() => toggleProduct(p._id)} className="accent-current" />
                          <span className="flex-1 min-w-0 truncate">{p.title}</span>
                          <span className="text-xs text-text-faint font-mono shrink-0">${Number(p.price).toFixed(2)}</span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
              </>
            )}
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 disabled:opacity-60">
          {saving ? "Saving..." : "Save Campaign"}
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
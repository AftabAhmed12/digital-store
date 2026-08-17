import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", shortDescription: "", price: "", category: "", currency: "usd", discountPercent: 0, isActive: true,
  });
  const [existingImages, setExistingImages] = useState([]); // [{url, publicId}] already saved
  const [removedImageIds, setRemovedImageIds] = useState([]); // publicIds marked for deletion
  const [newImages, setNewImages] = useState([]); // File[] newly selected
  const [digitalFile, setDigitalFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/admin/${id}`).then((res) => {
        const product = res.data;
        if (product) {
          setForm({ ...product });
          setExistingImages(product.images || []);
        }
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleNewImages = (e) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = ""; // allow re-selecting the same file if removed and re-added
  };

  const handleDigitalFile = (e) => {
    const file = e.target.files[0];
    if (file && !/\.pdf$/i.test(file.name) && file.type !== "application/pdf") {
      setError("The digital product file must be a PDF (.pdf)");
      e.target.value = "";
      return;
    }
    setDigitalFile(file);
    setError("");
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExisting = (publicId) => {
    setRemovedImageIds((prev) =>
      prev.includes(publicId) ? prev.filter((id) => id !== publicId) : [...prev, publicId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      newImages.forEach((file) => fd.append("images", file));
      if (digitalFile) fd.append("digitalFile", digitalFile);
      if (isEdit && removedImageIds.length) {
        fd.append("removedImageIds", JSON.stringify(removedImageIds));
      }

      if (isEdit) {
        await api.put(`/products/admin/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        if (!digitalFile) throw new Error("Digital file is required for a new product");
        if (newImages.length === 0) throw new Error("At least one product image is required");
        await api.post("/products/admin", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-px py-10 max-w-3xl">
      <h1 className="font-display font-700 text-2xl mb-8">{isEdit ? "Edit Product" : "New Product"}</h1>
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-5">
        <Field label="Title"><input name="title" required value={form.title} onChange={handleChange} className="input" /></Field>
        <Field label="Short description (shown on cards)">
          <input name="shortDescription" value={form.shortDescription} onChange={handleChange} className="input" />
        </Field>
        <Field label="Full description">
          <textarea name="description" required rows={4} value={form.description} onChange={handleChange} className="input resize-none" />
        </Field>
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Price (USD)"><input type="number" step="0.01" name="price" required value={form.price} onChange={handleChange} className="input" /></Field>
          <Field label="Discount % (0–90, optional)">
            <input type="number" step="1" min="0" max="90" name="discountPercent" value={form.discountPercent} onChange={handleChange} className="input" />
          </Field>
          <Field label="Category"><input name="category" required value={form.category} onChange={handleChange} className="input" /></Field>
        </div>

        {/* Product images gallery */}
        <Field label="Product images (you can select multiple — first image is used as the thumbnail)">
          <input type="file" accept="image/*" multiple onChange={handleNewImages} className="input" />
        </Field>

        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className="grid grid-cols-4 gap-3">
            {existingImages.map((img) => {
              const marked = removedImageIds.includes(img.publicId);
              return (
                <div key={img.publicId} className={`relative rounded-lg overflow-hidden border ${marked ? "border-red-500 opacity-40" : "border-border"}`}>
                  <img src={img.url} alt="Product" className="w-full aspect-square object-cover" />
                  <button
                    type="button"
                    onClick={() => toggleRemoveExisting(img.publicId)}
                    className="absolute top-1 right-1 bg-ink/80 text-xs px-2 py-0.5 rounded text-text-primary"
                  >
                    {marked ? "Undo" : "Remove"}
                  </button>
                </div>
              );
            })}
            {newImages.map((file, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-teal/50">
                <img src={URL.createObjectURL(file)} alt="New upload" className="w-full aspect-square object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 bg-ink/80 text-xs px-2 py-0.5 rounded text-text-primary"
                >
                  Remove
                </button>
                <span className="absolute bottom-1 left-1 bg-teal/80 text-ink text-[10px] px-1.5 py-0.5 rounded">New</span>
              </div>
            ))}
          </div>
        )}

        <Field label={`Digital product file (PDF only)${isEdit ? " — leave empty to keep current" : ""}`}>
          <input type="file" accept=".pdf,application/pdf" onChange={handleDigitalFile} className="input" />
          {isEdit && form.digitalFile?.fileName && (
            <p className="text-xs text-text-faint mt-2">Current file: {form.digitalFile.fileName}</p>
          )}
          {digitalFile && (
            <p className="text-xs text-teal mt-2">New file: {digitalFile.name}</p>
          )}
        </Field>
        <label className="flex items-center gap-2 text-sm text-text-muted">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          Active (visible to customers)
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="bg-gold text-ink font-semibold px-6 py-3 rounded-lg hover:brightness-110 disabled:opacity-60">
          {saving ? "Saving..." : "Save Product"}
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

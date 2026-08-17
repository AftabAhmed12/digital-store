import { useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Modal from "../../components/Modal.jsx";
import useOnceEffect from "../../hooks/useOnceEffect.js";

const MODULES = [
  { key: "products", label: "Products" },
  { key: "blogs", label: "Blogs" },
  { key: "coupons", label: "Coupons" },
  { key: "campaigns", label: "Campaigns" },
  { key: "orders", label: "Orders" },
  { key: "reviews", label: "Reviews" },
  { key: "leads", label: "Chat Leads" },
  { key: "messages", label: "Messages" },
];

const emptyPermissions = () =>
  Object.fromEntries(MODULES.map((m) => [m.key, { create: false, edit: false, delete: false }]));

// New admins get products + blogs add/edit by default, no delete — everything else off.
const defaultPermissions = () => {
  const p = emptyPermissions();
  p.products = { create: true, edit: true, delete: false };
  p.blogs = { create: true, edit: true, delete: false };
  return p;
};

const mergePermissions = (perms) => {
  const src = perms || {};
  const base = emptyPermissions();
  MODULES.forEach((m) => {
    const mod = src[m.key];
    if (mod) {
      base[m.key] = {
        create: Boolean(mod.create),
        edit: Boolean(mod.edit),
        delete: Boolean(mod.delete),
      };
    }
  });
  return base;
};

const summarize = (perms) => {
  const p = perms || {};
  return (
    MODULES.filter((m) => p[m.key] && (p[m.key].create || p[m.key].edit || p[m.key].delete))
      .map((m) => m.label)
      .join(", ") || "No access"
  );
};

function PermissionRow({ label, perms, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-5">
        {[
          { key: "create", label: "Create" },
          { key: "edit", label: "Edit" },
          { key: "delete", label: "Delete" },
        ].map((a) => (
          <label key={a.key} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={Boolean(perms?.[a.key])}
              onChange={() => onChange(a.key)}
              className="accent-gold w-4 h-4"
            />
            <span className="text-xs text-text-muted">{a.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", permissions: null, isSuperAdmin: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admin/manage")
      .then((res) => setAdmins(res.data))
      .catch(() => setError("Failed to load admins. Refresh the page or check your connection."))
      .finally(() => setLoading(false));
  };

  useOnceEffect(load, []);

  const openAdd = () => {
    setError("");
    setForm({ name: "", email: "", password: "", permissions: defaultPermissions(), isSuperAdmin: false });
    setModal("add");
  };

  const openEdit = (admin) => {
    setError("");
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      permissions: mergePermissions(admin.permissions),
      isSuperAdmin: admin.isSuperAdmin,
    });
    setModal(admin._id);
  };

  const togglePermission = (module, action) => {
    setForm((prev) => {
      const perms = prev.permissions || emptyPermissions();
      return {
        ...prev,
        permissions: {
          ...perms,
          [module]: { ...perms[module], [action]: !perms[module][action] },
        },
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      isSuperAdmin: form.isSuperAdmin,
      ...(form.isSuperAdmin ? {} : { permissions: form.permissions }),
      ...(form.password ? { password: form.password } : {}),
    };
    try {
      if (modal === "add") {
        await api.post("/admin/manage", { ...payload, password: form.password });
      } else {
        await api.put(`/admin/manage/${modal}`, payload);
      }
      setModal(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!confirm(`Delete admin ${admin.name}? This cannot be undone.`)) return;
    await api.delete(`/admin/manage/${admin._id}`);
    load();
  };

  const inputClass =
    "w-full bg-ink border border-border rounded-lg px-4 py-2.5 text-sm focus:border-gold outline-none";

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-700 text-2xl">Admin Management</h1>
          <p className="text-text-faint text-sm mt-1">
            Add or edit team members and control which tabs each admin can access.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="bg-gold text-ink font-semibold px-4 py-2 rounded-lg text-sm hover:brightness-110"
        >
          + Add Admin
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[760px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Access</th>
              <th className="p-4">Created</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a._id} className="border-b border-border last:border-0 hover:bg-ink/40 transition-colors">
                <td className="p-4 font-medium">{a.name}</td>
                <td className="p-4 text-text-muted">{a.email}</td>
                <td className="p-4">
                  {a.isSuperAdmin ? (
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-gold/15 text-gold border border-gold/30">
                      Super Admin
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface2 border border-border text-text-muted">
                      Admin
                    </span>
                  )}
                </td>
                <td className="p-4 text-text-muted max-w-[280px]">{summarize(a.permissions)}</td>
                <td className="p-4 text-text-faint">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right whitespace-nowrap space-x-3">
                  {a.isSuperAdmin ? (
                    <span className="text-xs text-text-faint">Protected</span>
                  ) : (
                    <>
                      <button onClick={() => openEdit(a)} className="text-blue hover:underline">Edit</button>
                      <button onClick={() => handleDelete(a)} className="text-red-400 hover:underline">Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && (
          <p className="m-4 text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        {!error && admins.length === 0 && <p className="p-8 text-center text-text-faint">No admins found.</p>}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} size="max-w-2xl">
        <form onSubmit={handleSave}>
          <div className="flex items-start justify-between gap-4 mb-5">
            <h3 className="font-display font-700 text-xl">{modal === "add" ? "Add Admin" : "Edit Admin"}</h3>
            <button type="button" onClick={() => setModal(null)} aria-label="Close" className="text-text-faint hover:text-text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-text-muted mb-2">Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={inputClass}
                placeholder="Admin name"
              />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={inputClass}
                placeholder="admin@email.com"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-text-muted mb-2">
              Password {modal === "add" ? "*" : "(leave blank to keep current)"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required={modal === "add"}
              className={inputClass}
              placeholder={modal === "add" ? "Set a password" : "Enter new password"}
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none bg-ink border border-border rounded-xl px-4 py-3 mb-5">
            <input
              type="checkbox"
              checked={form.isSuperAdmin}
              onChange={(e) => setForm({ ...form, isSuperAdmin: e.target.checked })}
              className="accent-gold w-4 h-4"
            />
            <span className="text-sm font-medium">Super Admin</span>
            <span className="text-xs text-text-faint">Full access to every module + admin management. No module limits.</span>
          </label>

          <p className="text-xs uppercase tracking-widest text-gold font-semibold mb-3">Module access</p>
          <div className="bg-ink border border-border rounded-xl px-4 mb-1">
            {MODULES.map((m) => (
              <PermissionRow
                key={m.key}
                label={m.label}
                perms={form.permissions?.[m.key]}
                onChange={(action) => togglePermission(m.key, action)}
              />
            ))}
          </div>
          <p className="text-xs text-text-faint mb-5">
            An admin can view a tab once any action is enabled for it. Dashboard is always available to every admin.
          </p>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-xl hover:brightness-110 transition disabled:opacity-60"
          >
            {saving ? "Saving..." : modal === "add" ? "Create Admin" : "Save Changes"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
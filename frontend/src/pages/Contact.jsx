import { useState } from "react";
import api from "../api/axios.js";
import Seo from "../components/Seo.jsx";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    try {
      await api.post("/contact", form);
      setStatus({ loading: false, success: true, error: "" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || "Failed to send message" });
    }
  };

  return (
    <div className="container-px max-w-2xl mx-auto py-16">
      <Seo
        title="Contact Us — Vaultly Support"
        description="Questions about a product or an order? Send us a message and we'll get back to you."
      />
      <h1 className="font-display font-700 text-3xl md:text-4xl mb-3">Contact Us</h1>
      <p className="text-text-faint mb-10">Questions about a product or an order? Send us a message.</p>

      {status.success ? (
        <div className="bg-surface border border-teal/40 rounded-xl p-6 text-center">
          <p className="text-teal font-semibold mb-1">Message sent!</p>
          <p className="text-text-faint text-sm">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-muted mb-2">Name</label>
              <input name="name" required value={form.name} onChange={handleChange}
                className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none" />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Email</label>
              <input type="email" name="email" required value={form.email} onChange={handleChange}
                className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Subject</label>
            <input name="subject" required value={form.subject} onChange={handleChange}
              className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Message</label>
            <textarea name="message" required rows={5} value={form.message} onChange={handleChange}
              className="w-full bg-ink border border-border rounded-lg px-4 py-3 text-sm focus:border-gold outline-none resize-none" />
          </div>
          {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
          <button type="submit" disabled={status.loading}
            className="w-full bg-gold text-ink font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-60">
            {status.loading ? "Sending..." : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}

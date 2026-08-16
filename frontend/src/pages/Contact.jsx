import { useState } from "react";
import api from "../api/axios.js";
import Seo from "../components/Seo.jsx";
import SocialLinks from "../components/SocialLinks.jsx";

const infoItems = [
  {
    label: "Email us",
    value: "support@vaultly.com",
    sub: "For order & product questions",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    ),
  },
  {
    label: "Response time",
    value: "Within 24 hours",
    sub: "Usually much faster",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5M9 2h6" />
      </svg>
    ),
  },
  {
    label: "Order help",
    value: "Instant delivery issues",
    sub: "We'll resend your download link",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 12h-6l-2 3h-4l-2-3H2" />
        <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
      </svg>
    ),
  },
];

const fieldClass =
  "w-full bg-ink border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-colors";

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
    <div className="container-px max-w-6xl mx-auto py-16 md:py-24">
      <Seo
        title="Contact Us — Vaultly Support"
        description="Questions about a product or an order? Send us a message and we'll get back to you."
      />

      <div className="text-center mb-12 md:mb-16">
        <p className="text-gold text-xs uppercase tracking-[3px] font-semibold mb-3">Get in touch</p>
        <h1 className="font-display font-700 text-4xl md:text-5xl mb-4">
          Let&apos;s <span className="text-gold">talk</span>
        </h1>
        <p className="text-text-muted max-w-xl mx-auto">
          Questions about a product, an order, or the store itself? Drop us a line and we&apos;ll get back to you.
        </p>
      </div>

      {status.success ? (
        <div className="relative overflow-hidden rounded-3xl border border-teal/40 bg-surface p-12 text-center max-w-xl mx-auto">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-teal/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-teal/15 text-teal flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-display font-600 text-2xl mb-2">Message sent!</h2>
            <p className="text-text-faint">We&apos;ll get back to you as soon as possible.</p>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Info panel */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 md:col-span-2">
            <div className="pointer-events-none absolute -top-24 -left-16 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 w-64 h-64 rounded-full bg-teal/10 blur-3xl" />
            <div className="relative space-y-6">
              <p className="text-xs uppercase tracking-widest text-teal font-semibold">Contact details</p>
              {infoItems.map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-ink border border-border text-gold flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm text-text-faint">{item.label}</p>
                    <p className="font-medium">{item.value}</p>
                    <p className="text-xs text-text-faint">{item.sub}</p>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-muted leading-relaxed">
                  Need any other help? Start a live chat and we&apos;ll assist you right away.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-3xl p-7 md:col-span-3 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-text-muted mb-2">Name</label>
                <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className={fieldClass} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-2">Email</label>
                <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@email.com" className={fieldClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Subject</label>
              <input name="subject" required value={form.subject} onChange={handleChange} placeholder="How can we help?" className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm text-text-muted mb-2">Message</label>
              <textarea name="message" required rows={6} value={form.message} onChange={handleChange} placeholder="Tell us a bit more..." className={`${fieldClass} resize-none`} />
            </div>

            {status.error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                {status.error}
              </p>
            )}

            <button
              type="submit"
              disabled={status.loading}
              className="w-full bg-gold text-ink font-semibold py-3.5 rounded-xl hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {status.loading ? (
                "Sending..."
              ) : (
                <>
                  Send Message
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      <div className="mt-20">
        <SocialLinks />
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Seo from "../components/Seo.jsx";
import SocialLinks from "../components/SocialLinks.jsx";

const benefits = [
  {
    title: "Reach a targeted audience",
    desc: "Get your work in front of digital product buyers, creators, freelancers, and small business owners who actively search for tools, templates, and practical advice.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2M17 11l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Earn a dofollow backlink",
    desc: "Every accepted post includes one dofollow link to your website, portfolio, or blog, placed naturally inside the article where it adds real SEO value for your own rankings.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    title: "Build authority & credibility",
    desc: "Publishing here positions you as a thought leader in digital products, ecommerce, and online business — a strong signal for clients and partners.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
      </svg>
    ),
  },
  {
    title: "Get promoted on social",
    desc: "Accepted posts are shared across our social channels, extending your reach far beyond the blog itself.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 4 9.5 16.5M22 4l-7 17-4.5-8L2 9l20-5Z" />
      </svg>
    ),
  },
  {
    title: "Fast, modern platform",
    desc: "Your article lives on a fast, clean, mobile-first site with strong on-page SEO — the kind of platform that gives your content the best chance to rank.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
];

const topics = [
  {
    title: "Digital Products & Downloads",
    desc: "Guides on creating, pricing, and selling digital products like ebooks, courses, presets, software, and printables.",
    tags: ["digital products", "sell digital downloads", "product pricing"],
  },
  {
    title: "Templates & Design Resources",
    desc: "Roundups and deep-dives on templates, fonts, graphics, UI kits, and design assets that help people work faster.",
    tags: ["templates", "design resources", "UI kits"],
  },
  {
    title: "Selling Online & Ecommerce",
    desc: "Store setup, conversion optimization, payment setup, and growing an online store that sells digital goods.",
    tags: ["ecommerce", "online store", "digital downloads store"],
  },
  {
    title: "Digital Marketing & SEO",
    desc: "Actionable marketing, content, and SEO strategies for creators and small businesses selling online.",
    tags: ["SEO", "content marketing", "digital marketing"],
  },
  {
    title: "Freelancing & Productivity",
    desc: "Workflow, client management, pricing, and productivity tips for freelancers and solopreneurs.",
    tags: ["freelancing", "productivity", "remote work"],
  },
  {
    title: "Tools, Apps & Technology",
    desc: "Honest comparisons, tutorials, and workflows built around the latest tools and apps for online business.",
    tags: ["tools", "apps", "tech tutorials"],
  },
  {
    title: "Small Business & Entrepreneurship",
    desc: "Practical lessons on starting, scaling, and running a small online business in 2026.",
    tags: ["small business", "entrepreneurship", "startup"],
  },
  {
    title: "How-To Tutorials & Buyer Guides",
    desc: "Step-by-step tutorials and honest buyer guides that help our audience make confident purchase decisions.",
    tags: ["tutorials", "buyer guides", "how-to"],
  },
];

const guidelines = [
  {
    title: "Original, exclusive content",
    desc: "We only publish content that has never appeared anywhere else — not on your blog, LinkedIn, Medium, or any guest post directory.",
  },
  {
    title: "1,000–2,000 words",
    desc: "Write with depth. Articles under 1,000 words rarely get accepted unless the topic is genuinely tight and valuable.",
  },
  {
    title: "Actionable & well-structured",
    desc: "Use clear H2/H3 subheadings, short paragraphs, and bullet points. Include step-by-step advice readers can actually use.",
  },
  {
    title: "Add 3–5 visuals",
    desc: "Screenshots, charts, or original graphics make a post far more useful. Stock photos alone are not enough.",
  },
  {
    title: "Clean, professional writing",
    desc: "No fluff, no keyword stuffing, no AI-generated filler. We will lightly edit for clarity, grammar, and SEO.",
  },
  {
    title: "Author byline",
    desc: "Send the author name you'd like displayed — every published post is credited with an author byline at the top.",
  },
];

const rejected = [
  "Spun, scraped, or AI-generated content",
  "Pure sales pitches or promotional advertorials",
  "Gambling, crypto, adult, pharmacy, loans, or betting topics",
  "Keyword-stuffed articles written only for backlinks",
  "Unsubstantiated claims, fake statistics, or plagiarized sections",
  "Articles attacking competitors or naming and shaming",
];

const linkPolicy = [
  {
    title: "One dofollow link",
    desc: "Each article earns one dofollow link within the article body, pointing to a relevant page on your website, portfolio, or blog.",
  },
  {
    title: "Relevance is everything",
    desc: "Links must add genuine value for the reader. Irrelevant or promotional links will be removed before publishing.",
  },
  {
    title: "No paid links",
    desc: "We never accept paid placements inside guest posts. Guest posts must be editorial content, not advertisements.",
  },
  {
    title: "Internal links required",
    desc: "Please include at least 1–2 internal links to relevant articles on the Vaultly blog to help readers discover related content.",
  },
  {
    title: "External links to authorities",
    desc: "Cite reputable sources, studies, or tools where relevant. No links to spammy or low-authority sites.",
  },
];

const steps = [
  { num: "01", title: "Read the guidelines", desc: "Make sure your idea fits our topics, format, and quality bar before you pitch." },
  { num: "02", title: "Check the blog first", desc: "Browse our recent posts to confirm we haven't already covered your exact angle." },
  { num: "03", title: "Send your pitch", desc: "Use the form below with a proposed title, a short outline, and a little about you." },
  { num: "04", title: "We review it", desc: "Our editors respond within 3–5 business days with a yes, no, or suggestions." },
  { num: "05", title: "Draft & submit", desc: "Once approved, write the full article and send it with the author name you'd like credited on the byline." },
  { num: "06", title: "We publish & promote", desc: "After light editing, your post goes live with a dofollow link and social promotion." },
];

const faqs = [
  {
    q: "Do you pay guest contributors?",
    a: "We believe in fair, value-driven partnerships with our writers. Compensation for a guest contribution is discussed on a case-by-case basis after we review your pitch — the details depend on the topic, scope, and the value the article brings to our readers.",
  },
  {
    q: "Can I include a link to my website in my post?",
    a: "Yes — each accepted post earns one dofollow link within the article, as long as it's relevant to the topic and adds value for the reader.",
  },
  {
    q: "How long should my guest post be?",
    a: "Aim for 1,000 to 2,000 words of original, well-structured, actionable content. Depth and usefulness matter more than hitting an exact word count.",
  },
  {
    q: "How long does it take to review my pitch?",
    a: "We typically respond within 3 to 5 business days. If you haven't heard back after a week, feel free to follow up.",
  },
  {
    q: "Do you accept AI-generated or spun content?",
    a: "No. All submissions must be original and written by a human. Duplicate, spun, or AI-generated content is rejected immediately.",
  },
  {
    q: "Can I republish my guest post on my own blog?",
    a: "No — guest posts on Vaultly must be exclusive to us and cannot be published anywhere else, including your own website.",
  },
];

const fieldClass =
  "w-full bg-ink border border-border rounded-xl px-4 py-3 text-sm focus:border-gold outline-none transition-colors";

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function WriteForUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    website: "",
    topic: "",
    audience: "",
    outline: "",
    samples: "",
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: "" });
    const message = [
      `Website/Portfolio: ${form.website || "—"}`,
      `Target audience: ${form.audience || "—"}`,
      "",
      `Outline / key points:`,
      form.outline || "—",
      "",
      `Writing samples: ${form.samples || "—"}`,
    ].join("\n");
    try {
      await api.post("/contact", {
        name: form.name,
        email: form.email,
        subject: form.topic ? `Guest Post Pitch — ${form.topic}` : "Guest Post Pitch",
        message,
      });
      setStatus({ loading: false, success: true, error: "" });
      setForm({ name: "", email: "", website: "", topic: "", audience: "", outline: "", samples: "" });
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.response?.data?.message || "Failed to send your pitch" });
    }
  };

  return (
    <div className="container-px max-w-6xl mx-auto py-16 md:py-24">
      <Seo
        title="Write for Us — Contribute a Guest Post to the Vaultly Blog"
        description="Write for us and share your expertise on digital products, templates, ecommerce, and online business. We accept original guest posts with a dofollow link in the article. Submit your pitch today."
        jsonLd={faqJsonLd}
      />

      {/* ============ HERO ============ */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-14 md:px-16 md:py-20 text-center mb-16">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="relative">
          <p className="text-gold text-xs uppercase tracking-[3px] font-semibold mb-4">Guest posting opportunities</p>
          <h1 className="font-display font-700 text-4xl md:text-5xl mb-5">
            Write for <span className="text-gold">Vaultly</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            We're looking for writers who can share practical, original insights on digital products,
            templates, ecommerce, and online business. Get published on a fast, modern blog — with a
            dofollow link in your article.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#pitch-form" className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition">
              Submit your pitch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#guidelines" className="inline-flex items-center gap-2 bg-ink border border-border font-semibold px-6 py-3 rounded-xl hover:border-gold transition">
              Read the guidelines
            </a>
          </div>
        </div>
      </div>

      {/* ============ BENEFITS ============ */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <p className="text-teal text-xs uppercase tracking-widest font-semibold mb-3">Why contribute</p>
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">Why write for Vaultly?</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Guest posting here is more than a backlink — it's a chance to grow your audience, authority,
            and online presence.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
              <div className="w-11 h-11 rounded-xl bg-ink border border-border text-gold flex items-center justify-center mb-4">
                {b.icon}
              </div>
              <h3 className="font-display font-600 text-lg mb-2">{b.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ AUDIENCE ============ */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-12 md:px-12 mb-16">
        <div className="pointer-events-none absolute -top-24 -left-16 w-72 h-72 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Who we publish for</p>
            <h2 className="font-display font-700 text-3xl mb-4">Our audience</h2>
            <p className="text-text-muted leading-relaxed mb-5">
              The Vaultly blog is read by people who buy, create, and sell digital products every day.
              Your post should speak directly to them:
            </p>
            <ul className="space-y-3">
              {[
                "Digital product creators and sellers",
                "Freelancers and solopreneurs",
                "Small business owners",
                "Designers, developers, and content creators",
                "Marketers and ecommerce managers",
              ].map((a) => (
                <li key={a} className="flex items-center gap-3 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                  <span className="text-text-muted">{a}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-ink p-6">
            <p className="text-xs uppercase tracking-widest text-text-faint mb-4">Quick facts</p>
            <dl className="space-y-4">
              {[
                ["Delivery", "Instant digital downloads"],
                ["Focus", "Digital products & online business"],
                ["Audience", "Buyers, creators, and sellers"],
                ["Backlink", "Dofollow link in post"],
                ["Review time", "3–5 business days"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-text-faint">{k}</dt>
                  <dd className="text-sm font-medium text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ============ TOPICS ============ */}
      <section className="mb-16" id="topics">
        <div className="text-center mb-10">
          <p className="text-teal text-xs uppercase tracking-widest font-semibold mb-3">What we're looking for</p>
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">Topics we accept</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            We accept guest posts on digital products, templates, ecommerce, digital marketing, and
            everything around building a business online.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {topics.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-surface p-6 flex flex-col">
              <h3 className="font-display font-600 text-base mb-2">{t.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed mb-4 flex-1">{t.desc}</p>
              <div className="flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-[11px] px-2.5 py-1 rounded-full bg-ink border border-border text-text-faint">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ GUIDELINES ============ */}
      <section className="mb-16" id="guidelines">
        <div className="text-center mb-10">
          <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">Before you pitch</p>
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">Guest posting guidelines</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Follow these rules to give your submission the best chance of being published.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {guidelines.map((g, i) => (
            <div key={g.title} className="flex gap-4 rounded-2xl border border-border bg-surface p-6">
              <span className="shrink-0 w-9 h-9 rounded-lg bg-ink border border-border text-gold font-display font-700 text-sm flex items-center justify-center">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-display font-600 mb-1.5">{g.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ LINK POLICY ============ */}
      <section className="mb-16">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          <div className="rounded-2xl border border-border bg-surface p-7">
            <p className="text-teal text-xs uppercase tracking-widest font-semibold mb-3">Link & SEO policy</p>
            <h2 className="font-display font-700 text-2xl mb-5">Our linking rules</h2>
            <ul className="space-y-4">
              {linkPolicy.map((l) => (
                <li key={l.title} className="flex gap-3">
                  <svg className="shrink-0 mt-1 text-teal" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <div>
                    <p className="font-medium text-sm mb-1">{l.title}</p>
                    <p className="text-sm text-text-muted leading-relaxed">{l.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-7">
            <p className="text-red-400/90 text-xs uppercase tracking-widest font-semibold mb-3">We don't publish</p>
            <h2 className="font-display font-700 text-2xl mb-5">Content we reject</h2>
            <ul className="space-y-3">
              {rejected.map((r) => (
                <li key={r} className="flex gap-3 text-sm text-text-muted">
                  <svg className="shrink-0 mt-0.5 text-red-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ HOW TO SUBMIT ============ */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <p className="text-gold text-xs uppercase tracking-widest font-semibold mb-3">The process</p>
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">How to submit a guest post</h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            From pitch to published post in six simple steps.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((s) => (
            <div key={s.num} className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6">
              <span className="font-display font-700 text-4xl text-gold/25 absolute -top-1 right-4">{s.num}</span>
              <h3 className="font-display font-600 text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PITCH FORM ============ */}
      <section id="pitch-form" className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-12 md:px-12 mb-16">
        <div className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="relative grid md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <p className="text-teal text-xs uppercase tracking-widest font-semibold mb-3">Submit your pitch</p>
            <h2 className="font-display font-700 text-3xl mb-4">Ready to write for us?</h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Fill in the form and our editorial team will review your pitch. Be specific about your topic
              and the value it will bring our readers — it makes approval much more likely.
            </p>
            <div className="rounded-2xl border border-border bg-ink p-5 space-y-3">
              <p className="text-sm text-text-faint">
                Prefer email? Pitch us at{" "}
                <a href="mailto:content@vaultly.com" className="text-gold hover:underline">
                  content@vaultly.com
                </a>{" "}
                with "Guest Post — [Proposed Title]" in the subject line.
              </p>
              <p className="text-sm text-text-faint">
                Check our{" "}
                <Link to="/blog" className="text-gold hover:underline">
                  latest articles
                </Link>{" "}
                before you pitch to avoid duplicating a topic.
              </p>
            </div>
          </div>

          <div className="md:col-span-3">
            {status.success ? (
              <div className="relative overflow-hidden rounded-2xl border border-teal/40 bg-ink p-10 text-center">
                <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-teal/15 text-teal flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h3 className="font-display font-600 text-xl mb-2">Pitch received!</h3>
                <p className="text-sm text-text-muted mb-5">
                  Thanks for your interest. Our editorial team will get back to you within 3–5 business days.
                </p>
                <button
                  onClick={() => setStatus({ loading: false, success: false, error: "" })}
                  className="text-gold text-sm font-semibold hover:underline"
                >
                  Submit another pitch
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Full name *</label>
                    <input name="name" required value={form.name} onChange={handleChange} placeholder="Your name" className={fieldClass} />
                  </div>
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Email *</label>
                    <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="you@email.com" className={fieldClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Website / portfolio URL</label>
                  <input name="website" value={form.website} onChange={handleChange} placeholder="https://yourwebsite.com" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Proposed topic / title *</label>
                  <input name="topic" required value={form.topic} onChange={handleChange} placeholder="e.g. How to Price Digital Products in 2026" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Target audience</label>
                  <input name="audience" value={form.audience} onChange={handleChange} placeholder="e.g. Freelancers selling downloadable templates" className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Outline / key points *</label>
                  <textarea name="outline" required rows={5} value={form.outline} onChange={handleChange} placeholder="A short outline or bullet points of what your post will cover..." className={`${fieldClass} resize-none`} />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-2">Writing samples</label>
                  <input name="samples" value={form.samples} onChange={handleChange} placeholder="Link to your portfolio or 1–2 published articles" className={fieldClass} />
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
                      Submit guest post pitch
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
                <p className="text-xs text-text-faint text-center">
                  By submitting, you agree to our guest posting guidelines. Pitches are reviewed within 3–5 business days.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============ FAQS ============ */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <p className="text-teal text-xs uppercase tracking-widest font-semibold mb-3">Got questions?</p>
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">Guest post FAQs</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-border bg-surface overflow-hidden">
              <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-display font-600 text-base list-none">
                {f.q}
                <svg className="shrink-0 text-gold transition-transform group-open:rotate-45" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className="px-6 pb-5 text-sm text-text-muted leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface px-8 py-14 text-center mb-16">
        <div className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-teal/10 blur-3xl" />
        <div className="relative">
          <h2 className="font-display font-700 text-3xl md:text-4xl mb-4">
            Have an idea worth <span className="text-gold">sharing?</span>
          </h2>
          <p className="text-text-muted max-w-xl mx-auto mb-8">
            We'd love to read your pitch. Original, practical, and helpful content is always welcome on the
            Vaultly blog.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#pitch-form" className="inline-flex items-center gap-2 bg-gold text-ink font-semibold px-6 py-3 rounded-xl hover:brightness-110 transition">
              Submit your pitch
            </a>
            <Link to="/blog" className="inline-flex items-center gap-2 bg-ink border border-border font-semibold px-6 py-3 rounded-xl hover:border-gold transition">
              Read the blog
            </Link>
          </div>
        </div>
      </section>

      <SocialLinks />
    </div>
  );
}
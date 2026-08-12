import ChatLead from "../models/ChatLead.js";
import Product from "../models/Product.js";

// ---------- Small "brain" ----------

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "do", "does", "did", "can",
  "could", "would", "should", "to", "for", "of", "in", "on", "at", "and", "or",
  "but", "if", "then", "with", "about", "from", "my", "me", "i", "you", "your",
  "how", "what", "when", "where", "why", "who", "which", "want", "wanna", "need",
  "please", "pls", "just", "not", "no", "yes", "ok", "okay", "get", "got", "have",
  "has", "tell", "know", "say", "see", "looking", "give", "aur", "hai", "hao", "tha",
  "kya", "kar", "ko", "bee", "nahi", "nhin", "maine", "mujhe", "mere", "mera", "se", "par",
]);

// Phrases map to a friendly, knowledge-based answer.
const FAQ = [
  {
    id: "how-to-buy",
    keys: [
      "how to buy", "buy a product", "buy product", "buy it", "order a product",
      "how do i buy", "place an order", "kharid", "kalie", "kese buy", "buy now",
      "purchase", "checkout", "how to get", "how do i get", "khazeed", "khareed",
    ],
    reply:
      "Buying from Vaultly is a 30-second job:\n\n1. Open the Products page and pick what you need.\n2. Hit the buy button and pay securely with Stripe — cards, Apple Pay and Google Pay all work.\n3. The payment clears and the download link lands in your inbox automatically.\n\nNo account, no login, no waiting.",
  },
  {
    id: "payment",
    keys: [
      "payment", "pay for", "paying", "card", "stripe", "apple pay", "google pay",
      "paypal", "mastercard", "visa", "debit", "credit card", "payment method",
      "secure", "transaction", "currency", "inr", "pkr", "usd", "funds",
    ],
    reply:
      "We take payments through Stripe with full encryption — cards, Apple Pay and Google Pay are all supported. Your card details never touch our servers, and once the payment clears (usually in seconds) the product is emailed to you automatically.",
  },
  {
    id: "delivery",
    keys: [
      "download", "deliver", "received", "receive", "email", "inbox", "link",
      "when do i get", "when will i", "get my", "sent to", "file", "instant",
      "immediately", "product kab", "kab mil", "kab aye", "mil gayi", "mil", "bhejo",
    ],
    reply:
      "Delivery is automatic and instant. The moment your payment clears you get an email with a download button — no waiting, no manual steps.\n\nThe file is named after the product so you always know what you've got. If you don't see it, check your spam/junk folder too — it helps to add our sender address to your contacts.",
  },
  {
    id: "refund-cancel",
    keys: [
      "refund", "cancel", "cancelled", "cancel my order", "money back", "return",
      "wapis", "change my mind", "wrong product", "wrong item", "refundable",
    ],
    reply:
      "If you ordered something by mistake or changed your mind, that's fine — reach out through the Contact page with your order email and we'll sort it out. Since delivery is instant, refunds are handled case by case, but we always try to keep it fair.",
  },
  {
    id: "login-account",
    keys: [
      "login", "log in", "sign up", "register", "account", "password", "no login",
      "no account", "create account", "profile", "signout", "sign out",
    ],
    reply:
      "There's no account system on purpose — no login, no password, no profile to manage. You just pay with your email, and your product comes straight to your inbox. Zero friction, zero forgotten passwords.",
  },
  {
    id: "catalog",
    keys: [
      "products do you", "what do you sell", "what do you have", "catalog", "catalogue",
      "categories", "available", "list of", "browse", "browsing", "shop", "store",
      "products", "product", "items", "what can i buy",
    ],
    reply: null, // handled dynamically by product search
  },
  {
    id: "price",
    keys: [
      "price", "prices", "cost", "how much", "expensive", "cheap", "affordable",
      "daam", "kitne ka", "kitna", "charge", "fee", "discount", "offer", "deal",
    ],
    reply:
      "Every product shows its price right on the product page — no hidden fees. Prices are in USD by default. You can browse everything on the Products page and filter by what catches your eye.",
  },
  {
    id: "contact",
    keys: [
      "contact", "support", "help", "assist", "human", "agent", "customer service",
      "talk to someone", "reach you", "email you", "complain", "problem", "madad",
      "issue", "help me",
    ],
    reply:
      "Happy to help! For anything this chat can't answer, the Contact page is the fastest way to reach a human — we typically reply within a day. For order or delivery questions, mention the email you paid with so we can trace it quickly.",
  },
  {
    id: "about",
    keys: [
      "what is vaultly", "about vaultly", "what is this", "who are you", "about",
      "about us", "company", "who owns", "site kya", "kya hai ye", "startup", "team",
    ],
    reply:
      "Vaultly is a digital store for instant downloads — fonts, templates, UI kits and more. You pick a product, pay once, and it's in your inbox within seconds. No accounts, no subscriptions, no friction — that's the whole idea.",
  },
];

const SEARCH_TRIGGERS = [
  "do you have", "have you", "is there", "find", "search", "recommend",
  "available", "sell", "suggest", "offer", "show", "list", "browse",
  "koi", "chahiye", "chiye", "mil sakta", "mila",
];

const GREETINGS = ["hi", "hello", "hey", "salam", "salaam", "assalam", "hola", "yo", "salamu"];

const tokens = (msg) =>
  msg.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length >= 2 && !STOPWORDS.has(t));

const includesAny = (msg, keys) => keys.some((k) => msg.includes(k));

// ---------- Product intelligence ----------

const searchProducts = (msg, products, queryTokens) => {
  const scored = products.map((p) => {
    const title = (p.title || "").toLowerCase();
    const category = (p.category || "").toLowerCase();
    const short = (p.shortDescription || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();

    let score = 0;
    for (const t of queryTokens) {
      if (title.includes(t)) score += 4;
      if (category.includes(t)) score += 3;
      if (short.includes(t)) score += 2;
      if (desc.includes(t)) score += 1;
    }
    // Whole message phrase contained in the title is a very strong signal
    const phrase = msg.toLowerCase().trim();
    if (phrase.length > 3 && title.includes(phrase)) score += 8;
    return { p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.p.salesCount - a.p.salesCount)
    .slice(0, 3)
    .map((s) => s.p);
};

const formatProductList = (matches) =>
  matches
    .map((p, i) => `${i + 1}. ${p.title} — $${p.price.toFixed(2)}`)
    .join("\n");

// ---------- Replies ----------

const greetingReply =
  "Hey, I'm Vaultly Assistant — your guide to the shop.\n\nAsk me about products, buying, payment or delivery and I'll point you the right way. Try things like:\n\n• \"Do you have fonts?\"\n• \"How do I buy?\"\n• \"When will I get my download?\"";

const capabilitiesReply =
  "Here's what I can do for you:\n\n• Find a product or category — e.g. \"do you have UI kits?\"\n• How to buy, pay or get your download\n• Refunds, contacts and account questions\n• Recommend what to grab next\n\nWhat would you like to know?";

const notFoundReply =
  "I couldn't find it on the shelf right now — but we add new drops often, so it may land soon!\n\nIn the meantime try a different word, or head to the Products page to see everything we have. If it's something specific you need, the Contact page is the fastest way to ask us directly.";

const outOfScopeReply =
  "I love the curiosity — but that one's a bit out of my lane! I'm focused on Vaultly's products, orders and downloads.\n\nTry asking things like \"How do I buy?\", \"Do you have business cards?\" or \"When will my download arrive?\" — and for anything else, the Contact page will get a human on it fast.";

const makeReply = (message, products) => {
  const msg = message.trim().toLowerCase();
  if (!msg) return "Say something like \"Do you have fonts?\" and I'll point you in the right direction.";

  // 1. Short greeting
  const words = msg.split(/\s+/);
  if (words.length <= 4 && GREETINGS.some((g) => msg.split(/\W+/)[0] === g)) {
    return greetingReply;
  }

  // 2. Explicit capability menu
  if (includesAny(msg, ["what can you do", "help me out", "how can you help", "your options", "menu", "commands", "start over"])) {
    return capabilitiesReply;
  }

  const queryTokens = tokens(msg);
  const strongSearch = includesAny(msg, SEARCH_TRIGGERS) ||
    (queryTokens.length > 0 && products.some((p) => queryTokens.some((t) => (p.category || "").toLowerCase().includes(t))));
  const matches = searchProducts(msg, products, queryTokens);
  const faqHit = queryTokens.length > 0
    ? FAQ.find((item) => item.reply && includesAny(msg, item.keys) && tokens(item.keys.join(" ")).some((t) => queryTokens.includes(t)))
    : null;

  // 3. Unambiguous product hunt wins over everything ("find", "you have", "sell"…)
  if (strongSearch && matches.length > 0) {
    return (
      `Here's what I found:\n\n${formatProductList(matches)}\n\n` +
      `Tap one on the Products page and you can grab it instantly. Want me to check a different product?`
    );
  }

  // 4. FAQ intents (refund, payment, delivery, etc.)
  if (faqHit) return faqHit.reply;

  // 5. Implicit product suggestion — user typed a product-ish phrase directly
  if (matches.length > 0) {
    return (
      `Sound like you're after something like this:\n\n${formatProductList(matches)}\n\n` +
      `Want me to get you to one of these? Just say the word.`
    );
  }

  // 6. Explicit hunt came up empty
  if (strongSearch) return notFoundReply;

  // 7. Fallback
  return outOfScopeReply;
};

// ---------- Handlers ----------

// @desc Register a lead (email captured BEFORE any conversation) + greeting
// @route POST /api/chat/start
// body: { email }
export const startChat = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    const lead = await ChatLead.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $setOnInsert: { firstSeenAt: new Date() }, $set: { lastSeenAt: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ reply: greetingReply, leadId: lead._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc Answer a message and store the conversation against the lead
// @route POST /api/chat/message
// body: { email, message }
export const chatMessage = async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email || !message) return res.status(400).json({ message: "Email and message are required" });

    const products = await Product.find({ isActive: true }).select("title category price shortDescription description salesCount").lean();

    let lead = await ChatLead.findOne({ email: email.toLowerCase() });
    if (!lead) {
      lead = await ChatLead.create({ email: email.toLowerCase(), firstSeenAt: new Date() });
    }

    const questions = lead.questions || [];
    questions.push(message.trim().slice(0, 200));
    if (questions.length > 20) questions.shift();

    lead.questions = questions;
    lead.messageCount = (lead.messageCount || 0) + 1;
    lead.lastSeenAt = new Date();
    await lead.save();

    const reply = makeReply(message, products);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------- ADMIN ----------

export const adminGetChatLeads = async (req, res) => {
  const leads = await ChatLead.find().sort({ lastSeenAt: -1 }).limit(500);
  res.json(leads);
};
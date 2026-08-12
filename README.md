# Vaultly — MERN Digital Products Store

A full-stack digital products store: no customer login, guest checkout via Stripe,
instant product delivery by email, plus an admin panel for products/blogs/orders.

## Stack
- **Frontend:** React (Vite) + Tailwind CSS + React Router
- **Backend:** Node.js + Express + MongoDB (Mongoose)
- **Payments:** Stripe Checkout + webhooks
- **File storage:** Cloudinary (images + digital product files)
- **Email:** Resend (transactional email with a custom HTML template)
- **Admin auth:** JWT + bcrypt

## Folder structure
```
digital-store/
  backend/     -> Express API
  frontend/    -> React app (public site + admin panel)
```

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — from MongoDB Atlas
- `JWT_SECRET` — any long random string
- `STRIPE_SECRET_KEY` — from Stripe Dashboard > Developers > API keys
- `STRIPE_WEBHOOK_SECRET` — see step 3 below
- `CLOUDINARY_*` — from Cloudinary Dashboard
- `RESEND_API_KEY` — from resend.com
- `EMAIL_FROM` — must be a verified sender/domain in Resend
- `ADMIN_EMAIL` — where contact form messages are sent

Run it:
```bash
npm run dev
```

### Create the first admin account
The `/api/admin/register` route is a one-time setup route protected by your `JWT_SECRET`
(so it can't be abused publicly). Call it once, e.g. with curl:

```bash
curl -X POST http://localhost:5000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"yourStrongPassword","setupKey":"YOUR_JWT_SECRET_VALUE"}'
```

After creating your admin, it's recommended to remove or comment out this route (or its usage)
in `routes/adminRoutes.js` for production.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to `http://localhost:5000` (see `vite.config.js`),
so both servers should run together during development.

## 3. Stripe webhook (required for automatic email delivery)

Payment confirmation → order fulfillment → email delivery is driven entirely by a **Stripe webhook**,
not by the browser redirect. This is intentional and important: a webhook can't be faked by a user
closing the tab or editing the URL, unlike trusting the success page alone.

**Local testing** with the Stripe CLI:
```bash
stripe listen --forward-to localhost:5000/api/webhook
```
This prints a `whsec_...` value — put it in `STRIPE_WEBHOOK_SECRET` in your `.env`.

**Production:** in the Stripe Dashboard, add an endpoint pointing to
`https://yourdomain.com/api/webhook` listening for the `checkout.session.completed` event,
then copy its signing secret into `STRIPE_WEBHOOK_SECRET`.

## 4. Cloudinary
Create a free account at cloudinary.com, grab your cloud name / API key / API secret from the
dashboard. Product cover images are stored as public images; the actual digital product files
are uploaded as `resource_type: raw` files, whose Cloudinary URL is only ever included in the
delivery email (never returned by the public product API).

## 5. Resend (email)
Sign up at resend.com, verify a sending domain (or use their test domain while developing),
create an API key, and set `RESEND_API_KEY` + `EMAIL_FROM`. The order-confirmation email
template lives in `backend/utils/emailTemplate.js` — edit the inline styles/copy there to
match your brand.

## How the purchase flow works
1. Customer opens a product page, enters their email, clicks "Buy Now"
2. Backend creates a Stripe Checkout Session and a `pending` Order record, returns the Stripe URL
3. Customer pays on Stripe's hosted checkout page
4. Stripe sends a `checkout.session.completed` webhook to `/api/webhook`
5. Backend verifies the webhook signature, marks the order `paid`, emails the digital file link
   via Resend, marks the order `email_sent`
6. Customer is redirected to `/order-success`, which polls the order status and confirms delivery

## Admin panel
Visit `/admin/login`. From there:
- **Dashboard** — revenue, order counts, recent orders
- **Products** — create/edit/delete, upload cover image + the digital file
- **Blogs** — create/edit/delete posts by category
- **Orders** — view all orders, manually resend the delivery email if needed

## Deployment notes
- Deploy backend (Render/Railway/Fly.io) and frontend (Vercel/Netlify) separately, or serve the
  built frontend from Express as static files.
- Set `CLIENT_URL` in the backend `.env` to your deployed frontend URL (used for Stripe redirect
  URLs and CORS).
- Remember to point the Stripe webhook at your deployed backend URL, not localhost.

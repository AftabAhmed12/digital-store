import Stripe from "stripe";
import { fulfillOrder } from "./orderController.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: this route must receive the RAW request body (see routes/webhookRoutes.js + server.js)
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    try {
      await fulfillOrder(session);
    } catch (err) {
      console.error("Order fulfillment error:", err.message);
      // Return 200 anyway so Stripe doesn't endlessly retry; log for manual follow-up
    }
  }

  res.json({ received: true });
};

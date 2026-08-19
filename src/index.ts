import Stripe from "stripe";

export interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_CHAT_ID: string;
  STRIPE_SECRET_KEY?: string;
}

const HANDLED_EVENTS = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse({
        ok: true,
        service: "StripePing",
        version: "0.1.0",
        setup: {
          webhook: "POST /webhook/stripe",
          stripe_events: [...HANDLED_EVENTS],
          secrets: [
            "STRIPE_WEBHOOK_SECRET",
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_CHAT_ID",
          ],
        },
      });
    }

    if (request.method === "POST" && url.pathname === "/webhook/stripe") {
      return handleStripeWebhook(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

async function handleStripeWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    const message = formatTelegramMessage(event);
    await sendTelegramMessage(env, message);
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

function formatTelegramMessage(event: Stripe.Event): string {
  switch (event.type) {
    case "payment_intent.succeeded":
      return formatPaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent
      );
    case "payment_intent.payment_failed":
      return formatPaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent
      );
    case "charge.refunded":
      return formatChargeRefunded(event.data.object as Stripe.Charge);
    case "customer.subscription.deleted":
      return formatSubscriptionDeleted(
        event.data.object as Stripe.Subscription
      );
    case "invoice.payment_failed":
      return formatInvoicePaymentFailed(event.data.object as Stripe.Invoice);
    default:
      return `<b>Stripe event</b>\nType: ${escapeHtml(event.type)}`;
  }
}

function formatPaymentIntentSucceeded(pi: Stripe.PaymentIntent): string {
  const amount = formatMoney(pi.amount, pi.currency);
  const customer = pi.receipt_email ?? pi.customer ?? "Unknown customer";

  return [
    "✅ <b>Payment succeeded</b>",
    "",
    `Amount: <b>${escapeHtml(amount)}</b>`,
    `Customer: ${escapeHtml(String(customer))}`,
    `Payment ID: <code>${escapeHtml(pi.id)}</code>`,
  ].join("\n");
}

function formatPaymentIntentFailed(pi: Stripe.PaymentIntent): string {
  const amount = formatMoney(pi.amount, pi.currency);
  const error =
    pi.last_payment_error?.message ?? "Payment could not be completed";

  return [
    "❌ <b>Payment failed</b>",
    "",
    `Amount: <b>${escapeHtml(amount)}</b>`,
    `Reason: ${escapeHtml(error)}`,
    `Payment ID: <code>${escapeHtml(pi.id)}</code>`,
  ].join("\n");
}

function formatChargeRefunded(charge: Stripe.Charge): string {
  const amount = formatMoney(charge.amount_refunded, charge.currency);
  const customer = charge.billing_details.email ?? charge.customer ?? "Unknown";

  return [
    "↩️ <b>Charge refunded</b>",
    "",
    `Refunded: <b>${escapeHtml(amount)}</b>`,
    `Customer: ${escapeHtml(String(customer))}`,
    `Charge ID: <code>${escapeHtml(charge.id)}</code>`,
  ].join("\n");
}

function formatSubscriptionDeleted(sub: Stripe.Subscription): string {
  const plan = sub.items.data[0]?.price;
  const planLabel = plan
    ? `${formatMoney(plan.unit_amount ?? 0, plan.currency)}/${plan.recurring?.interval ?? "period"}`
    : "Unknown plan";

  return [
    "🚫 <b>Subscription canceled</b>",
    "",
    `Plan: ${escapeHtml(planLabel)}`,
    `Customer: <code>${escapeHtml(String(sub.customer))}</code>`,
    `Subscription ID: <code>${escapeHtml(sub.id)}</code>`,
  ].join("\n");
}

function formatInvoicePaymentFailed(invoice: Stripe.Invoice): string {
  const amount = formatMoney(invoice.amount_due, invoice.currency);
  const customer = invoice.customer_email ?? invoice.customer ?? "Unknown";

  return [
    "⚠️ <b>Invoice payment failed</b>",
    "",
    `Amount due: <b>${escapeHtml(amount)}</b>`,
    `Customer: ${escapeHtml(String(customer))}`,
    `Invoice: <code>${escapeHtml(invoice.id ?? "unknown")}</code>`,
    invoice.hosted_invoice_url
      ? `<a href="${escapeHtml(invoice.hosted_invoice_url)}">View invoice</a>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMoney(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const zeroDecimal = ["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"].includes(code);
  const value = zeroDecimal ? amount : amount / 100;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).format(value);
  } catch {
    return `${value} ${code}`;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendTelegramMessage(env: Env, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error("Telegram API error", response.status, detail);
    throw new Error(`Telegram send failed: ${response.status}`);
  }
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

import Stripe from "stripe";
import {
  errorPage,
  landingPage,
  setupPage,
  successPage,
} from "./html";
import {
  getTenant,
  getTenantBySession,
  linkSessionToTenant,
  saveTenant,
  type TenantConfig,
} from "./tenant";

export interface Env {
  TENANTS: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  /** Platform Telegram — optional alerts when someone buys */
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

const HANDLED_EVENTS = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

const PRICE_CENTS = 1900;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = url.origin;

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return html(landingPage(origin));
      }

      if (request.method === "POST" && url.pathname === "/checkout") {
        return createCheckout(request, env, origin);
      }

      if (request.method === "GET" && url.pathname === "/success") {
        return handleSuccess(request, env, origin);
      }

      if (request.method === "GET" && url.pathname.startsWith("/setup/")) {
        const key = url.pathname.split("/")[2];
        if (!key) return html(errorPage("Missing setup key."), 400);
        const tenant = await getTenant(env.TENANTS, key);
        if (!tenant?.paid) return html(errorPage("Invalid or unpaid setup link."), 403);
        return html(setupPage(key, origin, false));
      }

      if (request.method === "POST" && url.pathname.startsWith("/setup/")) {
        const key = url.pathname.split("/")[2];
        if (!key) return html(errorPage("Missing setup key."), 400);
        return saveSetup(request, env, key, origin);
      }

      if (request.method === "POST" && url.pathname === "/webhook/platform") {
        return handlePlatformWebhook(request, env);
      }

      const tenantMatch = url.pathname.match(/^\/webhook\/stripe\/([^/]+)$/);
      if (request.method === "POST" && tenantMatch) {
        return handleTenantWebhook(request, env, tenantMatch[1]);
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return json({ ok: true, service: "stripeping", version: "0.2.0" });
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      console.error(err);
      return html(errorPage("Internal error. Try again."), 500);
    }
  },
};

async function createCheckout(
  _request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (!env.STRIPE_SECRET_KEY) {
    return html(errorPage("Checkout is not configured yet. Set STRIPE_SECRET_KEY."), 503);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: "StripePing Lifetime",
            description: "Stripe → Telegram alerts. Hosted webhook, pay once.",
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/`,
  });

  if (!session.url) {
    return html(errorPage("Could not start checkout."), 500);
  }

  return Response.redirect(session.url, 303);
}

async function handleSuccess(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return html(errorPage("Missing session_id."), 400);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return html(errorPage("Payment verification not configured."), 503);
  }

  const existing = await getTenantBySession(env.TENANTS, sessionId);
  if (existing) {
    return html(successPage(existing, origin));
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return html(errorPage("Payment not completed."), 402);
  }

  const tenantKey = crypto.randomUUID();
  const email =
    session.customer_details?.email ?? session.customer_email ?? "unknown";

  const tenant: TenantConfig = {
    email,
    stripeWebhookSecret: "",
    telegramBotToken: "",
    telegramChatId: "",
    createdAt: new Date().toISOString(),
    paid: true,
  };

  await saveTenant(env.TENANTS, tenantKey, tenant);
  await linkSessionToTenant(env.TENANTS, sessionId, tenantKey);

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    await sendTelegram(
      env.TELEGRAM_BOT_TOKEN,
      env.TELEGRAM_CHAT_ID,
      `💰 <b>StripePing sale</b>\nEmail: ${escapeHtml(email)}\nSetup: ${origin}/setup/${tenantKey}`
    ).catch(console.error);
  }

  return html(successPage(tenantKey, origin));
}

async function saveSetup(
  request: Request,
  env: Env,
  key: string,
  origin: string
): Promise<Response> {
  const tenant = await getTenant(env.TENANTS, key);
  if (!tenant?.paid) {
    return html(errorPage("Invalid setup link."), 403);
  }

  const form = await request.formData();
  const stripeWebhookSecret = String(form.get("stripeWebhookSecret") ?? "").trim();
  const telegramBotToken = String(form.get("telegramBotToken") ?? "").trim();
  const telegramChatId = String(form.get("telegramChatId") ?? "").trim();

  if (!stripeWebhookSecret.startsWith("whsec_")) {
    return html(setupPage(key, origin, false, "Stripe secret must start with whsec_"), 400);
  }
  if (!telegramBotToken.includes(":")) {
    return html(setupPage(key, origin, false, "Telegram bot token looks invalid."), 400);
  }
  if (!telegramChatId) {
    return html(setupPage(key, origin, false, "Telegram chat ID is required."), 400);
  }

  await saveTenant(env.TENANTS, key, {
    ...tenant,
    stripeWebhookSecret,
    telegramBotToken,
    telegramChatId,
  });

  return html(setupPage(key, origin, true));
}

async function handlePlatformWebhook(
  request: Request,
  env: Env
): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing signature or secret", { status: 400 });
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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.id && session.payment_status === "paid") {
      const existing = await getTenantBySession(env.TENANTS, session.id);
      if (!existing) {
        const tenantKey = crypto.randomUUID();
        const email =
          session.customer_details?.email ??
          session.customer_email ??
          "unknown";
        await saveTenant(env.TENANTS, tenantKey, {
          email,
          stripeWebhookSecret: "",
          telegramBotToken: "",
          telegramChatId: "",
          createdAt: new Date().toISOString(),
          paid: true,
        });
        await linkSessionToTenant(env.TENANTS, session.id, tenantKey);
      }
    }
  }

  return json({ received: true });
}

async function handleTenantWebhook(
  request: Request,
  env: Env,
  tenantKey: string
): Promise<Response> {
  const tenant = await getTenant(env.TENANTS, tenantKey);
  if (!tenant?.paid || !tenant.stripeWebhookSecret) {
    return new Response("Tenant not configured", { status: 404 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(
      body,
      signature,
      tenant.stripeWebhookSecret
    );
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    const message = formatTelegramMessage(event);
    await sendTelegram(
      tenant.telegramBotToken,
      tenant.telegramChatId,
      message
    );
  }

  return json({ received: true });
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
  const zeroDecimal = [
    "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF",
    "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
  ].includes(code);
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

async function sendTelegram(
  botToken: string,
  chatId: string,
  text: string
): Promise<void> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    }
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram failed: ${response.status} ${detail}`);
  }
}

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

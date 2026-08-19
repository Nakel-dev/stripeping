import Stripe from "stripe";
import { createHmac, timingSafeEqual } from "node:crypto";
import { verifyBachsSignature, formatBachsCollection, type BachsWebhookEvent } from "./bachs";

export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8")
    );
  } catch {
    return false;
  }
}

export function verifyFlutterwaveSignature(
  signature: string | null,
  secretHash: string
): boolean {
  if (!signature) return false;
  try {
    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(secretHash, "utf8")
    );
  } catch {
    return false;
  }
}

export function formatPaystackEvent(payload: {
  event?: string;
  data?: Record<string, unknown>;
}): string | null {
  const event = payload.event ?? "";
  const data = payload.data ?? {};

  if (event === "charge.success") {
    const amount = Number(data.amount ?? 0) / 100;
    const currency = String(data.currency ?? "NGN").toUpperCase();
    const email =
      (data.customer as { email?: string })?.email ??
      (data.authorization as { email?: string })?.email ??
      "Unknown";
    return [
      "✅ <b>Paystack payment received</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
      `Customer: ${escapeHtml(String(email))}`,
      data.reference
        ? `Ref: <code>${escapeHtml(String(data.reference))}</code>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (event === "charge.failed") {
    const amount = Number(data.amount ?? 0) / 100;
    const currency = String(data.currency ?? "NGN").toUpperCase();
    return [
      "❌ <b>Paystack payment failed</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
      data.gateway_response
        ? `Reason: ${escapeHtml(String(data.gateway_response))}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (event === "refund.processed" || event === "refund.pending") {
    const amount = Number(data.amount ?? 0) / 100;
    const currency = String(data.currency ?? "NGN").toUpperCase();
    return [
      "↩️ <b>Paystack refund</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
      data.transaction_reference
        ? `Txn: <code>${escapeHtml(String(data.transaction_reference))}</code>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (event === "transfer.success" || event === "transfer.failed") {
    const ok = event === "transfer.success";
    const amount = Number(data.amount ?? 0) / 100;
    const currency = String(data.currency ?? "NGN").toUpperCase();
    return [
      ok ? "✅ <b>Paystack transfer sent</b>" : "❌ <b>Paystack transfer failed</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
      data.reference
        ? `Ref: <code>${escapeHtml(String(data.reference))}</code>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return null;
}

export function formatFlutterwaveEvent(payload: {
  event?: string;
  data?: Record<string, unknown>;
}): string | null {
  const event = payload.event ?? "";
  const data = payload.data ?? {};

  if (event === "charge.completed") {
    const amount = Number(data.amount ?? data.charged_amount ?? 0);
    const currency = String(data.currency ?? "NGN").toUpperCase();
    const customer = data.customer as { email?: string } | undefined;
    const email = String(customer?.email ?? data.email ?? "Unknown");
    const status = String(data.status ?? "");
    if (status && status !== "successful") return null;
    return [
      "✅ <b>Flutterwave payment received</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
      `Customer: ${escapeHtml(email)}`,
      data.tx_ref ? `Ref: <code>${escapeHtml(String(data.tx_ref))}</code>` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (event === "charge.failed") {
    return [
      "❌ <b>Flutterwave payment failed</b>",
      "",
      data.processor_response
        ? `Reason: ${escapeHtml(String(data.processor_response))}`
        : "Payment could not be completed",
    ].join("\n");
  }

  if (event === "transfer.completed" || event === "transfer.failed") {
    const ok = event === "transfer.completed";
    const amount = Number(data.amount ?? 0);
    const currency = String(data.currency ?? "NGN").toUpperCase();
    return [
      ok ? "✅ <b>Flutterwave transfer sent</b>" : "❌ <b>Flutterwave transfer failed</b>",
      "",
      `Amount: <b>${escapeHtml(formatMoney(amount, currency))}</b>`,
    ].join("\n");
  }

  return null;
}

const STRIPE_HANDLED = new Set([
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
  "customer.subscription.deleted",
  "invoice.payment_failed",
]);

export function formatStripeEvent(event: Stripe.Event): string | null {
  if (!STRIPE_HANDLED.has(event.type)) return null;

  switch (event.type) {
    case "payment_intent.succeeded":
      return formatPaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
    case "payment_intent.payment_failed":
      return formatPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
    case "charge.refunded":
      return formatChargeRefunded(event.data.object as Stripe.Charge);
    case "customer.subscription.deleted":
      return formatSubscriptionDeleted(event.data.object as Stripe.Subscription);
    case "invoice.payment_failed":
      return formatInvoicePaymentFailed(event.data.object as Stripe.Invoice);
    default:
      return null;
  }
}

export function verifyBachsTenantWebhook(
  rawBody: string,
  secret: string,
  request: Request
): BachsWebhookEvent | null {
  const timestamp = request.headers.get("X-Bachs-Timestamp");
  const signature = request.headers.get("X-Bachs-Signature");
  if (!verifyBachsSignature(rawBody, secret, timestamp, signature)) return null;
  try {
    return JSON.parse(rawBody) as BachsWebhookEvent;
  } catch {
    return null;
  }
}

export function formatBachsTenantEvent(event: BachsWebhookEvent): string | null {
  return formatBachsCollection(event);
}

function formatPaymentIntentSucceeded(pi: Stripe.PaymentIntent): string {
  const amount = formatMoney(pi.amount, pi.currency);
  const customer = pi.receipt_email ?? pi.customer ?? "Unknown customer";
  return [
    "✅ <b>Stripe payment succeeded</b>",
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
    "❌ <b>Stripe payment failed</b>",
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
    "↩️ <b>Stripe charge refunded</b>",
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
    "🚫 <b>Stripe subscription canceled</b>",
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
    "⚠️ <b>Stripe invoice payment failed</b>",
    "",
    `Amount due: <b>${escapeHtml(amount)}</b>`,
    `Customer: ${escapeHtml(String(customer))}`,
    `Invoice: <code>${escapeHtml(invoice.id ?? "unknown")}</code>`,
  ].join("\n");
}

export function formatMoney(amount: number, currency: string): string {
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

import { createHmac, timingSafeEqual } from "node:crypto";

export const BACHS_API_BASE = "https://api.bachs.io";
export const BACHS_SANDBOX_BASE = "https://sandbox-api.bachs.io";

export interface BachsCheckoutResponse {
  checkout_id: string;
  checkout_url: string;
  status: string;
  reference?: string;
}

export interface BachsWebhookEvent {
  id: string;
  type: string;
  created_at?: string;
  data?: Record<string, unknown>;
}

export interface BachsCheckoutSession {
  checkout_id: string;
  status: string;
  reference?: string;
  customer?: { email?: string; name?: string };
  charge?: { status?: string } | null;
}

export async function getBachsCheckoutSession(
  apiKey: string,
  baseUrl: string,
  checkoutId: string
): Promise<BachsCheckoutSession | null> {
  const response = await fetch(`${baseUrl}/v1/checkout-sessions/${checkoutId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) return null;
  return (await response.json().catch(() => null)) as BachsCheckoutSession | null;
}

export function isBachsCheckoutPaid(session: BachsCheckoutSession): boolean {
  const status = session.status?.toLowerCase();
  if (status === "completed" || status === "succeeded") return true;
  const chargeStatus = session.charge?.status?.toLowerCase();
  return chargeStatus === "succeeded" || chargeStatus === "successful";
}

export function bachsApiBase(env: { BACHS_API_BASE?: string; BACHS_API_KEY?: string }): string {
  if (env.BACHS_API_BASE) return env.BACHS_API_BASE;
  if (env.BACHS_API_KEY?.startsWith("sk_sandbox_")) return BACHS_SANDBOX_BASE;
  return BACHS_API_BASE;
}

export async function createBachsCheckout(
  apiKey: string,
  baseUrl: string,
  opts: {
    email: string;
    name?: string;
    successUrl: string;
    cancelUrl: string;
    reference: string;
  }
): Promise<BachsCheckoutResponse> {
  const response = await fetch(`${baseUrl}/v1/checkout-sessions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pricing: {
        currency: "USD",
        amount: "19.00",
        currency_options: {
          NGN: "30000.00",
        },
      },
      customer: {
        email: opts.email,
        name: opts.name ?? opts.email.split("@")[0],
      },
      success_url: opts.successUrl,
      cancel_url: opts.cancelUrl,
      reference: opts.reference,
      metadata: { product: "stripeping_lifetime" },
      expires_in_minutes: 60,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as BachsCheckoutResponse & {
    message?: string;
    error?: string | { message?: string };
  };

  if (!response.ok || !body.checkout_url) {
    const detail =
      body.message ??
      (typeof body.error === "string" ? body.error : body.error?.message) ??
      `HTTP ${response.status}`;
    throw new Error(`Bachs checkout failed: ${detail}`);
  }

  return body;
}

export function verifyBachsSignature(
  rawBody: string,
  secret: string,
  timestampHeader: string | null,
  signatureHeader: string | null
): boolean {
  if (!timestampHeader || !signatureHeader) return false;

  const timestamp = parseInt(timestampHeader, 10);
  if (Number.isNaN(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const message = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret)
    .update(message, "utf8")
    .digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signatureHeader, "utf8")
    );
  } catch {
    return false;
  }
}

export function formatBachsCollection(event: BachsWebhookEvent): string | null {
  const data = event.data ?? {};
  const status = String(data.status ?? "");
  if (event.type === "collection.failed" || status === "failed") {
    const amount = String(data.amount ?? data.amount_paid ?? "?");
    const currency = String(data.currency ?? "USD").toUpperCase();
    return [
      "❌ <b>Bachs payment failed</b>",
      "",
      `Amount: <b>${escapeHtml(amount)} ${escapeHtml(currency)}</b>`,
      data.message ? `Reason: ${escapeHtml(String(data.message))}` : "",
      data.charge_id
        ? `Charge: <code>${escapeHtml(String(data.charge_id))}</code>`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  if (
    event.type !== "collection.succeeded" &&
    status !== "succeeded" &&
    status !== "successful"
  ) {
    return null;
  }

  const amount = String(data.amount_paid ?? data.amount ?? "?");
  const currency = String(data.currency ?? "USD").toUpperCase();
  const method = String(
    data.payment_method ?? data.payment_source_type ?? "payment"
  );
  const customer = (data.customer as { email?: string; name?: string }) ?? {};
  const email = customer.email ?? "Unknown";

  return [
    "✅ <b>Bachs payment received</b>",
    "",
    `Amount: <b>${escapeHtml(amount)} ${escapeHtml(currency)}</b>`,
    `Method: ${escapeHtml(method)}`,
    `Customer: ${escapeHtml(email)}`,
    data.charge_id
      ? `Charge: <code>${escapeHtml(String(data.charge_id))}</code>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

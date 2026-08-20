import {
  bachsApiBase,
  createBachsCheckout,
  getBachsCheckoutSession,
  isBachsCheckoutPaid,
  verifyBachsSignature,
  type BachsWebhookEvent,
} from "./bachs";
import {
  errorPage,
  landingPage,
  pendingPage,
  setupPage,
  successPage,
} from "./html";
import {
  formatBachsTenantEvent,
  formatFlutterwaveEvent,
  formatPaystackEvent,
  formatStripeEvent,
  verifyBachsTenantWebhook,
  verifyFlutterwaveSignature,
  verifyPaystackSignature,
} from "./providers";
import {
  emptyTenant,
  getCheckoutIdByReference,
  getCheckoutMeta,
  getProcessedEvent,
  getTenant,
  getTenantByCheckout,
  linkCheckoutToTenant,
  linkReferenceToCheckout,
  markProcessedEvent,
  saveCheckoutMeta,
  saveTenant,
  type PaymentProvider,
  type TenantConfig,
} from "./tenant";
import Stripe from "stripe";

export interface Env {
  TENANTS: KVNamespace;
  BACHS_API_KEY: string;
  BACHS_WEBHOOK_SECRET: string;
  BACHS_API_BASE?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = url.origin;

    try {
      if (request.method === "GET" && url.pathname === "/") {
        return html(landingPage(origin));
      }

      if (request.method === "POST" && url.pathname === "/checkout") {
        return await createCheckout(request, env, origin);
      }

      if (request.method === "GET" && url.pathname === "/success") {
        return await handleSuccess(request, env, origin);
      }

      if (request.method === "GET" && url.pathname.startsWith("/setup/")) {
        const key = url.pathname.split("/")[2];
        if (!key) return html(errorPage("Missing setup key."), 400);
        const tenant = await getTenant(env.TENANTS, key);
        if (!tenant?.paid) return html(errorPage("Invalid or unpaid setup link."), 403);
        return html(setupPage(key, origin, tenant, false));
      }

      if (request.method === "POST" && url.pathname.startsWith("/setup/")) {
        const key = url.pathname.split("/")[2];
        if (!key) return html(errorPage("Missing setup key."), 400);
        return await saveSetup(request, env, key, origin);
      }

      if (request.method === "POST" && url.pathname === "/webhook/platform/bachs") {
        return await handlePlatformBachsWebhook(request, env, origin);
      }

      const webhookMatch = url.pathname.match(
        /^\/webhook\/(stripe|paystack|flutterwave|bachs)\/([^/]+)$/
      );
      if (request.method === "POST" && webhookMatch) {
        return await handleTenantWebhook(
          request,
          env,
          webhookMatch[1] as PaymentProvider,
          webhookMatch[2]
        );
      }

      if (request.method === "GET" && url.pathname === "/health") {
        return json({ ok: true, service: "stripeping", version: "0.4.0" });
      }

      return new Response("Not Found", { status: 404 });
    } catch (err) {
      console.error(err);
      return html(errorPage("Internal error. Try again."), 500);
    }
  },
};

async function createCheckout(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (!env.BACHS_API_KEY) {
    return html(
      errorPage("Checkout is not configured yet. Set BACHS_API_KEY."),
      503
    );
  }

  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return html(errorPage("Enter a valid email to continue checkout."), 400);
  }

  const reference = `sp_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  try {
    const checkout = await createBachsCheckout(
      env.BACHS_API_KEY,
      bachsApiBase(env),
      {
        email,
        successUrl: `${origin}/success?reference=${encodeURIComponent(reference)}`,
        cancelUrl: `${origin}/`,
        reference,
      }
    );

    if (!checkout.checkout_url) {
      return html(errorPage("Could not start checkout."), 500);
    }

    await linkReferenceToCheckout(env.TENANTS, reference, checkout.checkout_id);
    await saveCheckoutMeta(env.TENANTS, checkout.checkout_id, { email, reference });

    return Response.redirect(checkout.checkout_url, 303);
  } catch (err) {
    console.error("Bachs checkout error:", err);
    const msg = err instanceof Error ? err.message : "Checkout failed";
    return html(errorPage(msg), 502);
  }
}

async function handleSuccess(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  const params = new URL(request.url).searchParams;
  let checkoutId =
    params.get("checkout_id") ??
    params.get("checkoutId") ??
    params.get("id");
  const reference = params.get("reference");

  if (!checkoutId && reference) {
    checkoutId = await getCheckoutIdByReference(env.TENANTS, reference);
  }

  if (!checkoutId) {
    return html(pendingPage());
  }

  const existingKey = await getTenantByCheckout(env.TENANTS, checkoutId);
  if (existingKey) {
    return html(successPage(existingKey, origin));
  }

  if (env.BACHS_API_KEY) {
    const session = await getBachsCheckoutSession(
      env.BACHS_API_KEY,
      bachsApiBase(env),
      checkoutId
    );
    if (session && isBachsCheckoutPaid(session)) {
      const meta = await getCheckoutMeta(env.TENANTS, checkoutId);
      const email =
        session.customer?.email ?? meta?.email ?? "unknown";
      const tenantKey = await provisionTenant(env, origin, checkoutId, email);
      return html(successPage(tenantKey, origin));
    }
  }

  return html(pendingPage());
}

async function provisionTenant(
  env: Env,
  origin: string,
  checkoutId: string,
  email: string
): Promise<string> {
  const existingKey = await getTenantByCheckout(env.TENANTS, checkoutId);
  if (existingKey) return existingKey;

  const tenantKey = crypto.randomUUID();
  await saveTenant(env.TENANTS, tenantKey, emptyTenant(email));
  await linkCheckoutToTenant(env.TENANTS, checkoutId, tenantKey);

  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
    await sendTelegram(
      env.TELEGRAM_BOT_TOKEN,
      env.TELEGRAM_CHAT_ID,
      `💰 <b>StripePing sale</b>\nEmail: ${escapeHtml(email)}\nSetup: ${origin}/setup/${tenantKey}`
    ).catch(console.error);
  }

  return tenantKey;
}

async function handlePlatformBachsWebhook(
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  const rawBody = await request.text();
  const timestamp = request.headers.get("X-Bachs-Timestamp");
  const signature = request.headers.get("X-Bachs-Signature");

  if (
    !env.BACHS_WEBHOOK_SECRET ||
    !verifyBachsSignature(rawBody, env.BACHS_WEBHOOK_SECRET, timestamp, signature)
  ) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: BachsWebhookEvent;
  try {
    event = JSON.parse(rawBody) as BachsWebhookEvent;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.id && (await getProcessedEvent(env.TENANTS, event.id))) {
    return json({ received: true, duplicate: true });
  }

  if (event.type === "collection.succeeded") {
    const data = event.data ?? {};
    const checkoutId = String(data.checkout_id ?? "");
    const email =
      (data.customer as { email?: string })?.email ??
      String(data.customer_email ?? "unknown");

    if (checkoutId) {
      await provisionTenant(env, origin, checkoutId, email);
    }
  }

  if (event.id) await markProcessedEvent(env.TENANTS, event.id);
  return json({ received: true });
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
  const enabledProviders = form
    .getAll("providers")
    .map((v) => String(v)) as PaymentProvider[];

  const secrets = { ...tenant.secrets };
  const stripe = String(form.get("stripeSecret") ?? "").trim();
  const paystack = String(form.get("paystackSecret") ?? "").trim();
  const flutterwave = String(form.get("flutterwaveSecret") ?? "").trim();
  const bachs = String(form.get("bachsSecret") ?? "").trim();
  const telegramBotToken = String(form.get("telegramBotToken") ?? "").trim();
  const telegramChatId = String(form.get("telegramChatId") ?? "").trim();
  const discordWebhookUrl = String(form.get("discordWebhookUrl") ?? "").trim();

  if (enabledProviders.length === 0) {
    return html(
      setupPage(key, origin, tenant, false, "Select at least one payment provider."),
      400
    );
  }

  if (enabledProviders.includes("stripe")) {
    if (!stripe.startsWith("whsec_")) {
      return html(
        setupPage(key, origin, tenant, false, "Stripe secret must start with whsec_"),
        400
      );
    }
    secrets.stripe = stripe;
  } else {
    delete secrets.stripe;
  }

  if (enabledProviders.includes("paystack")) {
    if (!paystack.startsWith("sk_")) {
      return html(
        setupPage(key, origin, tenant, false, "Paystack secret key must start with sk_"),
        400
      );
    }
    secrets.paystack = paystack;
  } else {
    delete secrets.paystack;
  }

  if (enabledProviders.includes("flutterwave")) {
    if (flutterwave.length < 8) {
      return html(
        setupPage(key, origin, tenant, false, "Flutterwave secret hash looks invalid."),
        400
      );
    }
    secrets.flutterwave = flutterwave;
  } else {
    delete secrets.flutterwave;
  }

  if (enabledProviders.includes("bachs")) {
    if (bachs.length < 8) {
      return html(
        setupPage(key, origin, tenant, false, "Bachs webhook secret looks invalid."),
        400
      );
    }
    secrets.bachs = bachs;
  } else {
    delete secrets.bachs;
  }

  const hasTelegram =
    Boolean(telegramBotToken) || Boolean(telegramChatId);
  const hasDiscord = Boolean(discordWebhookUrl);

  if (!hasTelegram && !hasDiscord) {
    return html(
      setupPage(
        key,
        origin,
        tenant,
        false,
        "Connect at least one alert destination: Telegram or Discord."
      ),
      400
    );
  }

  if (hasTelegram) {
    if (!telegramBotToken.includes(":")) {
      return html(
        setupPage(key, origin, tenant, false, "Telegram bot token looks invalid."),
        400
      );
    }
    if (!telegramChatId) {
      return html(
        setupPage(key, origin, tenant, false, "Telegram chat ID is required when using Telegram."),
        400
      );
    }
  }

  if (hasDiscord && !isDiscordWebhookUrl(discordWebhookUrl)) {
    return html(
      setupPage(
        key,
        origin,
        tenant,
        false,
        "Discord webhook URL must look like https://discord.com/api/webhooks/…"
      ),
      400
    );
  }

  const updated: TenantConfig = {
    ...tenant,
    enabledProviders,
    secrets,
    telegramBotToken: hasTelegram ? telegramBotToken : "",
    telegramChatId: hasTelegram ? telegramChatId : "",
    discordWebhookUrl: hasDiscord ? discordWebhookUrl : "",
  };

  await saveTenant(env.TENANTS, key, updated);
  return html(setupPage(key, origin, updated, true));
}

async function handleTenantWebhook(
  request: Request,
  env: Env,
  provider: PaymentProvider,
  tenantKey: string
): Promise<Response> {
  const tenant = await getTenant(env.TENANTS, tenantKey);
  if (!tenant?.paid || !tenant.enabledProviders.includes(provider)) {
    return new Response("Tenant not configured", { status: 404 });
  }

  const rawBody = await request.text();
  let message: string | null = null;

  if (provider === "stripe") {
    const secret = tenant.secrets.stripe;
    if (!secret) return new Response("Stripe not configured", { status: 404 });
    const signature = request.headers.get("stripe-signature");
    if (!signature) return new Response("Missing signature", { status: 400 });
    let event: Stripe.Event;
    try {
      event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch {
      return new Response("Invalid signature", { status: 400 });
    }
    message = formatStripeEvent(event);
  }

  if (provider === "paystack") {
    const secret = tenant.secrets.paystack;
    if (!secret) return new Response("Paystack not configured", { status: 404 });
    const signature = request.headers.get("x-paystack-signature");
    if (!verifyPaystackSignature(rawBody, signature, secret)) {
      return new Response("Invalid signature", { status: 401 });
    }
    let payload: { event?: string; data?: Record<string, unknown> };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    message = formatPaystackEvent(payload);
  }

  if (provider === "flutterwave") {
    const secret = tenant.secrets.flutterwave;
    if (!secret) return new Response("Flutterwave not configured", { status: 404 });
    const signature = request.headers.get("verif-hash");
    if (!verifyFlutterwaveSignature(signature, secret)) {
      return new Response("Invalid signature", { status: 401 });
    }
    let payload: { event?: string; data?: Record<string, unknown> };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    message = formatFlutterwaveEvent(payload);
  }

  if (provider === "bachs") {
    const secret = tenant.secrets.bachs;
    if (!secret) return new Response("Bachs not configured", { status: 404 });
    const event = verifyBachsTenantWebhook(rawBody, secret, request);
    if (!event) return new Response("Invalid signature", { status: 401 });
    message = formatBachsTenantEvent(event);
  }

  if (message) {
    await deliverAlert(tenant, message);
  }

  return json({ received: true });
}

async function deliverAlert(tenant: TenantConfig, message: string): Promise<void> {
  const tasks: Promise<void>[] = [];

  if (tenant.telegramBotToken && tenant.telegramChatId) {
    tasks.push(sendTelegram(tenant.telegramBotToken, tenant.telegramChatId, message));
  }

  if (tenant.discordWebhookUrl) {
    tasks.push(sendDiscord(tenant.discordWebhookUrl, message));
  }

  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") console.error("Alert delivery failed:", result.reason);
  }
}

function isDiscordWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "discord.com" ||
        parsed.hostname === "discordapp.com") &&
      parsed.pathname.startsWith("/api/webhooks/") &&
      parsed.pathname.split("/").filter(Boolean).length >= 3
    );
  } catch {
    return false;
  }
}

function htmlToDiscord(text: string): string {
  return text
    .replace(/<b>(.*?)<\/b>/gi, "**$1**")
    .replace(/<code>(.*?)<\/code>/gi, "`$1`")
    .replace(/<\/?[^>]+>/g, "")
    .slice(0, 2000);
}

async function sendDiscord(webhookUrl: string, htmlMessage: string): Promise<void> {
  const content = htmlToDiscord(htmlMessage);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Discord failed: ${response.status} ${detail}`);
  }
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

export type PaymentProvider = "stripe" | "paystack" | "flutterwave" | "bachs";

export interface TenantSecrets {
  stripe?: string;
  paystack?: string;
  flutterwave?: string;
  bachs?: string;
}

export interface TenantConfig {
  email: string;
  enabledProviders: PaymentProvider[];
  secrets: TenantSecrets;
  telegramBotToken: string;
  telegramChatId: string;
  discordWebhookUrl: string;
  createdAt: string;
  paid: boolean;
}

interface LegacyTenantConfig {
  email: string;
  stripeWebhookSecret?: string;
  telegramBotToken: string;
  telegramChatId: string;
  createdAt: string;
  paid: boolean;
}

function normalizeTenant(raw: unknown): TenantConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as LegacyTenantConfig & Partial<TenantConfig>;
  if (t.secrets && Array.isArray(t.enabledProviders)) {
    return {
      ...(t as TenantConfig),
      discordWebhookUrl: (t as TenantConfig).discordWebhookUrl ?? "",
    };
  }
  const stripe = t.stripeWebhookSecret?.trim();
  return {
    email: t.email ?? "",
    enabledProviders: stripe ? ["stripe"] : [],
    secrets: stripe ? { stripe } : {},
    telegramBotToken: t.telegramBotToken ?? "",
    telegramChatId: t.telegramChatId ?? "",
    discordWebhookUrl: "",
    createdAt: t.createdAt ?? new Date().toISOString(),
    paid: Boolean(t.paid),
  };
}

export async function getTenant(
  kv: KVNamespace,
  key: string
): Promise<TenantConfig | null> {
  const raw = await kv.get(`tenant:${key}`, "json");
  return normalizeTenant(raw);
}

export async function saveTenant(
  kv: KVNamespace,
  key: string,
  config: TenantConfig
): Promise<void> {
  await kv.put(`tenant:${key}`, JSON.stringify(config));
}

export async function getTenantByCheckout(
  kv: KVNamespace,
  checkoutId: string
): Promise<string | null> {
  return kv.get(`checkout:${checkoutId}`);
}

export async function linkCheckoutToTenant(
  kv: KVNamespace,
  checkoutId: string,
  tenantKey: string
): Promise<void> {
  await kv.put(`checkout:${checkoutId}`, tenantKey);
}

export async function linkReferenceToCheckout(
  kv: KVNamespace,
  reference: string,
  checkoutId: string
): Promise<void> {
  await kv.put(`ref:${reference}`, checkoutId, { expirationTtl: 60 * 60 * 24 * 7 });
}

export async function getCheckoutIdByReference(
  kv: KVNamespace,
  reference: string
): Promise<string | null> {
  return kv.get(`ref:${reference}`);
}

export async function saveCheckoutMeta(
  kv: KVNamespace,
  checkoutId: string,
  meta: { email: string; reference: string }
): Promise<void> {
  await kv.put(`checkout-meta:${checkoutId}`, JSON.stringify(meta), {
    expirationTtl: 60 * 60 * 24 * 7,
  });
}

export async function getCheckoutMeta(
  kv: KVNamespace,
  checkoutId: string
): Promise<{ email: string; reference: string } | null> {
  const raw = await kv.get(`checkout-meta:${checkoutId}`, "json");
  return raw as { email: string; reference: string } | null;
}

/** @deprecated use getTenantByCheckout */
export async function getTenantBySession(
  kv: KVNamespace,
  sessionId: string
): Promise<string | null> {
  return getTenantByCheckout(kv, sessionId);
}

/** @deprecated use linkCheckoutToTenant */
export async function linkSessionToTenant(
  kv: KVNamespace,
  sessionId: string,
  tenantKey: string
): Promise<void> {
  return linkCheckoutToTenant(kv, sessionId, tenantKey);
}

export async function getProcessedEvent(
  kv: KVNamespace,
  eventId: string
): Promise<boolean> {
  return (await kv.get(`event:${eventId}`)) !== null;
}

export async function markProcessedEvent(
  kv: KVNamespace,
  eventId: string
): Promise<void> {
  await kv.put(`event:${eventId}`, "1", { expirationTtl: 60 * 60 * 24 * 30 });
}

export function emptyTenant(email: string): TenantConfig {
  return {
    email,
    enabledProviders: [],
    secrets: {},
    telegramBotToken: "",
    telegramChatId: "",
    discordWebhookUrl: "",
    createdAt: new Date().toISOString(),
    paid: true,
  };
}

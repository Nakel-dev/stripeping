export interface TenantConfig {
  email: string;
  stripeWebhookSecret: string;
  telegramBotToken: string;
  telegramChatId: string;
  createdAt: string;
  paid: boolean;
}

export async function getTenant(
  kv: KVNamespace,
  key: string
): Promise<TenantConfig | null> {
  const raw = await kv.get(`tenant:${key}`, "json");
  return raw as TenantConfig | null;
}

export async function saveTenant(
  kv: KVNamespace,
  key: string,
  config: TenantConfig
): Promise<void> {
  await kv.put(`tenant:${key}`, JSON.stringify(config));
}

export async function getTenantBySession(
  kv: KVNamespace,
  sessionId: string
): Promise<string | null> {
  return kv.get(`session:${sessionId}`);
}

export async function linkSessionToTenant(
  kv: KVNamespace,
  sessionId: string,
  tenantKey: string
): Promise<void> {
  await kv.put(`session:${sessionId}`, tenantKey);
}

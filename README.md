# StripePing — Payment alerts in Telegram

Stripe, Paystack, Flutterwave & Bachs → Telegram for indie hackers.

## Deploy

### 1. Cloudflare login

```bash
npx wrangler login
```

### 2. KV namespace

Already configured in `wrangler.toml`. Create new ones only if starting fresh:

```bash
npx wrangler kv namespace create TENANTS
npx wrangler kv namespace create TENANTS --preview
```

### 3. Set secrets (Pages)

```bash
npx wrangler pages secret put BACHS_API_KEY --project-name stripeping
npx wrangler pages secret put BACHS_WEBHOOK_SECRET --project-name stripeping
```

Optional sale alerts to your Telegram:

```bash
npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name stripeping
npx wrangler pages secret put TELEGRAM_CHAT_ID --project-name stripeping
```

For sandbox testing, use a `sk_sandbox_...` key from [Bachs](https://bachs.io) and optionally:

```bash
npx wrangler pages secret put BACHS_API_BASE --project-name stripeping
# value: https://sandbox-api.bachs.io
```

### 4. Bachs platform webhook

In Bachs Developer Portal → Webhooks, add:

`https://stripeping.pages.dev/webhook/platform/bachs`

Subscribe to: `collection.succeeded`, `collection.failed`

### 5. Deploy

```bash
npm run deploy
```

Live URL: **https://stripeping.pages.dev**

---

## Customer flow

1. Visit `/` → enter email → Buy $19 (~₦30,000 via Bachs)
2. Bachs checkout (bank transfer, card, mobile money, etc.)
3. `/success?checkout_id=...` → `/setup/{key}`
4. Customer selects providers (Stripe / Paystack / Flutterwave / Bachs) + Telegram
5. Customer adds webhook URLs in each provider dashboard

---

## Webhook URLs (per customer)

| Provider | URL |
|----------|-----|
| Stripe | `POST /webhook/stripe/{key}` |
| Paystack | `POST /webhook/paystack/{key}` |
| Flutterwave | `POST /webhook/flutterwave/{key}` |
| Bachs | `POST /webhook/bachs/{key}` |

---

## Local dev

```bash
cp .env.example .dev.vars
npm run dev
```

## Endpoints

| Path | Description |
|------|-------------|
| `GET /` | Landing + buy form |
| `POST /checkout` | Start Bachs checkout |
| `GET /success` | After payment → setup link |
| `GET/POST /setup/:key` | Configure providers + Telegram |
| `POST /webhook/platform/bachs` | Your Bachs checkout webhook |
| `POST /webhook/{provider}/:key` | Customer payment events |
| `GET /health` | JSON health |

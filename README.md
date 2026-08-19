# StripePing — Stripe → Telegram for indie hackers

## Deploy

### 1. Cloudflare login

```bash
npx wrangler login
```

### 2. Create KV namespace

```bash
npx wrangler kv namespace create TENANTS
npx wrangler kv namespace create TENANTS --preview
```

Copy the `id` values into `wrangler.toml` under `[[kv_namespaces]]`.

### 3. Set secrets

```bash
npx wrangler secret put STRIPE_SECRET_KEY      # sk_live_ or sk_test_
npx wrangler secret put STRIPE_WEBHOOK_SECRET  # whsec_ for /webhook/platform (checkout)
```

Optional — ping yourself when someone buys:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

### 4. Deploy

```bash
npm run deploy
```

Your app lives at `https://stripeping.<subdomain>.workers.dev`

### 5. Platform Stripe webhook (optional)

In Stripe Dashboard, add endpoint:

`https://<your-worker>/webhook/platform`

Events: `checkout.session.completed`

(Success page also provisions tenants if this webhook is missing.)

---

## Customer flow

1. Visit `/` → Buy $19
2. Stripe Checkout → `/success` → `/setup/{key}`
3. Customer pastes **their** Stripe `whsec_`, Telegram bot token, chat ID
4. Customer adds **their** webhook URL in Stripe:

   `https://<your-worker>/webhook/stripe/{key}`

---

## Local dev

```bash
cp .env.example .dev.vars
# Fill STRIPE_SECRET_KEY, add kv preview ids in wrangler.toml
npm run dev
```

## Endpoints

| Path | Description |
|------|-------------|
| `GET /` | Landing + buy button |
| `POST /checkout` | Start Stripe Checkout |
| `GET /success` | After payment → setup link |
| `GET/POST /setup/:key` | Configure tenant |
| `POST /webhook/stripe/:key` | Customer Stripe events |
| `POST /webhook/platform` | Your checkout webhook |
| `GET /health` | JSON health |

# StripePing

Stripe webhook → Telegram notifications for indie hackers.

Get instant Telegram alerts when payments succeed, fail, get refunded, or subscriptions churn — without building your own notification stack.

## Quick start

### 1. Install

```bash
npm install
```

### 2. Create a Telegram bot

1. Open [@BotFather](https://t.me/BotFather) on Telegram.
2. Run `/newbot` and follow the prompts.
3. Copy the bot token → `TELEGRAM_BOT_TOKEN`.
4. Start a chat with your bot (or add it to a group/channel).
5. Get your chat ID:
   - DM: message [@userinfobot](https://t.me/userinfobot) or call `https://api.telegram.org/bot<TOKEN>/getUpdates` after messaging your bot.
   - Channel: use the channel ID (often `-100…`).

### 3. Create a Stripe webhook

1. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), click **Add endpoint**.
2. Endpoint URL: `https://<your-worker>.workers.dev/webhook/stripe`
3. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET`.

### 4. Set secrets (production)

```bash
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
```

Optional (not required for webhook-only flow):

```bash
npx wrangler secret put STRIPE_SECRET_KEY
```

### 5. Local development

Copy env template and fill in values:

```bash
cp .env.example .dev.vars
```

Edit `.dev.vars` (never commit this file):

```
STRIPE_WEBHOOK_SECRET=whsec_...
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHAT_ID=123456789
```

Run locally:

```bash
npm run dev
```

Forward Stripe webhooks with the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:8787/webhook/stripe
```

### 6. Deploy

```bash
npm run deploy
```

Update your Stripe webhook endpoint URL to the deployed Worker URL.

### 7. Verify

```bash
curl https://<your-worker>.workers.dev/
```

You should see a JSON health/setup response.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `TELEGRAM_BOT_TOKEN` | Yes | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Yes | Chat or channel ID for notifications |
| `STRIPE_SECRET_KEY` | No | Reserved for future Stripe API features |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check + setup JSON |
| `POST` | `/webhook/stripe` | Stripe webhook receiver |

Invalid Stripe signatures return **400**. Successful processing returns **200**.

## Product note

StripePing is positioned as a simple **$19** indie-hacker tool: deploy in minutes, no server to maintain, pay once for peace of mind on Stripe events.

## License

Private — all rights reserved.

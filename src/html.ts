export function landingPage(origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StripePing — Stripe events in Telegram</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #e8ecf4; line-height: 1.6; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 48px 20px 80px; }
    h1 { font-size: 2.2rem; letter-spacing: -0.03em; margin-bottom: 12px; }
    .tag { color: #8b9cb8; font-size: 1.05rem; margin-bottom: 32px; }
    .card { background: #141b2d; border: 1px solid #243049; border-radius: 14px; padding: 24px; margin-bottom: 20px; }
    .card h2 { font-size: 1rem; color: #a8b8d8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.06em; }
    ul { padding-left: 18px; color: #c5d0e6; }
    li { margin-bottom: 6px; }
    .price { font-size: 2rem; font-weight: 700; margin: 24px 0 8px; }
    .price span { font-size: 1rem; font-weight: 400; color: #8b9cb8; }
    .btn { display: inline-block; background: #635bff; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; font-size: 1rem; }
    .btn:hover { background: #7a73ff; }
    .note { font-size: 0.85rem; color: #6b7a96; margin-top: 16px; }
    code { background: #1a2236; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>StripePing</h1>
    <p class="tag">Get Telegram pings when Stripe money moves — payments, failures, refunds, churn.</p>

    <div class="card">
      <h2>What you get</h2>
      <ul>
        <li>Instant Telegram alerts for 5 Stripe events</li>
        <li>Your own webhook URL — no server to maintain</li>
        <li>Setup in under 10 minutes</li>
        <li>Lifetime access — pay once</li>
      </ul>
    </div>

    <div class="card">
      <h2>Events</h2>
      <ul>
        <li>payment_intent.succeeded</li>
        <li>payment_intent.payment_failed</li>
        <li>charge.refunded</li>
        <li>customer.subscription.deleted</li>
        <li>invoice.payment_failed</li>
      </ul>
    </div>

    <p class="price">$19 <span>one-time · lifetime</span></p>
    <form method="POST" action="${origin}/checkout">
      <button type="submit" class="btn">Buy StripePing — $19</button>
    </form>
    <p class="note">Secure checkout via Stripe. After payment you configure Telegram + your Stripe webhook secret.</p>
  </div>
</body>
</html>`;
}

export function setupPage(tenantKey: string, origin: string, saved: boolean, error?: string): string {
  const webhookUrl = `${origin}/webhook/stripe/${tenantKey}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StripePing Setup</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #e8ecf4; max-width: 640px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
    h1 { font-size: 1.6rem; margin-bottom: 8px; }
    p { color: #a8b8d8; margin-bottom: 16px; }
    label { display: block; font-size: 0.85rem; color: #8b9cb8; margin: 16px 0 6px; }
    input { width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #243049; background: #141b2d; color: #fff; font-size: 1rem; }
    .btn { margin-top: 24px; background: #635bff; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .ok { background: #14301f; border: 1px solid #2d6a4f; padding: 12px; border-radius: 8px; color: #86efac; margin-bottom: 16px; }
    .err { background: #3b1515; border: 1px solid #7f1d1d; padding: 12px; border-radius: 8px; color: #fca5a5; margin-bottom: 16px; }
    code { background: #1a2236; padding: 8px 10px; display: block; border-radius: 6px; word-break: break-all; margin: 8px 0 16px; font-size: 0.85rem; }
    ol { padding-left: 20px; color: #c5d0e6; }
    li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>StripePing setup</h1>
  ${saved ? '<div class="ok">Saved. Point Stripe at your webhook URL below and send a test event.</div>' : ""}
  ${error ? `<div class="err">${error}</div>` : ""}

  <p>Your webhook URL (paste this in Stripe Dashboard → Webhooks):</p>
  <code>${webhookUrl}</code>

  <form method="POST" action="/setup/${tenantKey}">
    <label>Stripe webhook signing secret (whsec_…)</label>
    <input name="stripeWebhookSecret" required placeholder="whsec_..." />

    <label>Telegram bot token (@BotFather)</label>
    <input name="telegramBotToken" required placeholder="123456:ABC..." />

    <label>Telegram chat ID</label>
    <input name="telegramChatId" required placeholder="123456789 or -100..." />

    <button type="submit" class="btn">Save &amp; activate</button>
  </form>

  <p style="margin-top:32px"><strong>Stripe events to enable:</strong></p>
  <ol>
    <li>payment_intent.succeeded</li>
    <li>payment_intent.payment_failed</li>
    <li>charge.refunded</li>
    <li>customer.subscription.deleted</li>
    <li>invoice.payment_failed</li>
  </ol>
</body>
</html>`;
}

export function successPage(tenantKey: string, origin: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment successful — StripePing</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0b0f19; color: #e8ecf4; max-width: 560px; margin: 0 auto; padding: 60px 20px; text-align: center; }
    h1 { margin-bottom: 12px; }
    p { color: #a8b8d8; margin-bottom: 24px; }
    .btn { display: inline-block; background: #635bff; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; }
  </style>
</head>
<body>
  <h1>Payment received</h1>
  <p>Configure Telegram and your Stripe webhook secret to start getting pings.</p>
  <a class="btn" href="${origin}/setup/${tenantKey}">Continue to setup →</a>
</body>
</html>`;
}

export function errorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Error</title>
  <style>body{font-family:system-ui;background:#0b0f19;color:#fca5a5;padding:40px;text-align:center}</style></head>
  <body><h1>Something went wrong</h1><p>${message}</p><p><a href="/" style="color:#8b9cb8">Back home</a></p></body></html>`;
}

import type { PaymentProvider, TenantConfig } from "./tenant";

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  stripe: "Stripe",
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  bachs: "Bachs",
};

const PROVIDER_COLORS: Record<PaymentProvider, string> = {
  stripe: "#635bff",
  paystack: "#00c3f7",
  flutterwave: "#f5a623",
  bachs: "#22c55e",
};

const PROVIDER_ICONS: Record<PaymentProvider, string> = {
  stripe: "◆",
  paystack: "▲",
  flutterwave: "●",
  bachs: "✦",
};

function baseStyles(): string {
  return `
    :root {
      --bg: #060911;
      --surface: rgba(15, 23, 42, 0.7);
      --surface-solid: #0f172a;
      --surface-hover: rgba(30, 41, 59, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-bright: rgba(99, 102, 241, 0.35);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --text-dim: #64748b;
      --accent: #6366f1;
      --accent-glow: rgba(99, 102, 241, 0.4);
      --green: #10b981;
      --green-glow: rgba(16, 185, 129, 0.3);
      --radius: 16px;
      --radius-sm: 10px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    
    /* Ambient Glow Mesh */
    .bg-glow {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
      background:
        radial-gradient(circle 800px at 50% -100px, rgba(99, 102, 241, 0.18), transparent 70%),
        radial-gradient(circle 600px at 90% 20%, rgba(16, 185, 129, 0.07), transparent 60%),
        radial-gradient(circle 600px at 10% 80%, rgba(0, 195, 247, 0.06), transparent 60%);
    }

    .container {
      position: relative;
      z-index: 1;
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 20px 80px;
    }

    /* Navbar */
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 48px;
      padding: 12px 0;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.03em;
      text-decoration: none;
      color: #fff;
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #6366f1, #10b981);
      display: grid;
      place-items: center;
      font-size: 0.95rem;
      box-shadow: 0 4px 16px var(--accent-glow);
    }
    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.12);
      border: 1px solid rgba(99, 102, 241, 0.25);
      color: #a5b4fc;
    }
    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      box-shadow: 0 0 8px var(--green);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    /* Hero Section */
    .hero {
      text-align: center;
      margin-bottom: 48px;
    }
    .hero-badge {
      margin-bottom: 18px;
      display: inline-flex;
    }
    .hero h1 {
      font-size: clamp(2.4rem, 6vw, 3.6rem);
      font-weight: 800;
      letter-spacing: -0.04em;
      line-height: 1.12;
      margin-bottom: 18px;
      background: linear-gradient(180deg, #ffffff 0%, #94a3b8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: clamp(1.05rem, 2.5vw, 1.25rem);
      color: var(--text-muted);
      max-width: 620px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }

    /* Live Interactive Demo Box */
    .demo-wrapper {
      background: var(--surface);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 48px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
    }
    .demo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
      gap: 12px;
    }
    .demo-title {
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .demo-tabs {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.35);
      padding: 4px;
      border-radius: 10px;
    }
    .demo-tab-btn {
      padding: 6px 14px;
      border-radius: 7px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .demo-tab-btn.active {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    /* Simulated Telegram Phone Bubble */
    .telegram-mockup {
      background: #17212b;
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      max-width: 500px;
      margin: 0 auto;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.4);
    }
    .tg-msg {
      background: #242f3d;
      border-radius: 12px 12px 12px 3px;
      padding: 14px 16px;
      font-size: 0.92rem;
      color: #e4ecf2;
      line-height: 1.5;
      animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tg-msg b { color: #fff; }
    .tg-msg code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: ui-monospace, monospace;
      font-size: 0.84rem;
      color: #64b5f6;
    }
    .tg-time {
      display: block;
      text-align: right;
      font-size: 0.7rem;
      color: #708499;
      margin-top: 6px;
    }
    @keyframes popIn {
      from { opacity: 0; transform: translateY(6px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Features Grid */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-bottom: 48px;
    }
    .card {
      background: var(--surface);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover {
      border-color: var(--border-bright);
      transform: translateY(-2px);
    }
    .card-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      display: grid;
      place-items: center;
      font-size: 1.2rem;
      margin-bottom: 16px;
    }
    .card h3 {
      font-size: 1.1rem;
      margin-bottom: 8px;
      color: #fff;
    }
    .card p {
      color: var(--text-muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Comparison Section */
    .comparison-section {
      background: linear-gradient(180deg, rgba(15,23,42,0.4), rgba(15,23,42,0.8));
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 32px 24px;
      margin-bottom: 48px;
    }
    .comp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }
    @media (max-width: 600px) {
      .comp-grid { grid-template-columns: 1fr; }
    }
    .comp-col {
      padding: 18px;
      border-radius: 12px;
    }
    .comp-bad {
      background: rgba(248, 113, 113, 0.05);
      border: 1px solid rgba(248, 113, 113, 0.15);
    }
    .comp-good {
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.25);
    }
    .comp-col h4 {
      font-size: 0.9rem;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .comp-bad h4 { color: #f87171; }
    .comp-good h4 { color: #34d399; }
    .comp-list { list-style: none; }
    .comp-list li {
      font-size: 0.88rem;
      color: #cbd5e1;
      margin-bottom: 8px;
      position: relative;
      padding-left: 20px;
    }
    .comp-bad li::before { content: "✕"; position: absolute; left: 0; color: #f87171; font-weight: 700; }
    .comp-good li::before { content: "✓"; position: absolute; left: 0; color: #34d399; font-weight: 700; }

    /* Pricing Box */
    .pricing-box {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(99, 102, 241, 0.35);
      border-radius: 24px;
      padding: 36px 28px;
      text-align: center;
      box-shadow: 0 24px 80px rgba(99, 102, 241, 0.15);
      margin-bottom: 48px;
      position: relative;
      overflow: hidden;
    }
    .pricing-box::before {
      content: "";
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 1px;
      background: linear-gradient(90deg, transparent, #a5b4fc, transparent);
    }
    .price-tag {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 12px;
      margin: 16px 0;
    }
    .price-num {
      font-size: 3.5rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: #fff;
    }
    .price-period {
      font-size: 1.05rem;
      color: var(--text-muted);
    }
    .checkout-form {
      max-width: 440px;
      margin: 24px auto 0;
      text-align: left;
    }
    .input-group {
      margin-bottom: 16px;
    }
    .input-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }
    input[type=email], input[type=text] {
      width: 100%;
      padding: 14px 16px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border);
      background: rgba(6, 9, 17, 0.7);
      color: #fff;
      font-size: 0.98rem;
      transition: all 0.2s;
    }
    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .btn-buy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 16px 28px;
      border-radius: var(--radius-sm);
      border: none;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
      font-size: 1.05rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 10px 30px var(--accent-glow);
      transition: all 0.2s;
    }
    .btn-buy:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 40px var(--accent-glow);
      background: linear-gradient(135deg, #7073ff, #5850ec);
    }
    .guarantee-note {
      font-size: 0.82rem;
      color: var(--text-dim);
      margin-top: 14px;
      text-align: center;
    }

    /* FAQ Section */
    .faq-title {
      text-align: center;
      font-size: 1.8rem;
      margin-bottom: 24px;
      letter-spacing: -0.03em;
    }
    .faq-grid {
      display: grid;
      gap: 12px;
      max-width: 760px;
      margin: 0 auto;
    }
    .faq-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
    }
    .faq-q {
      font-weight: 600;
      font-size: 0.98rem;
      color: #fff;
    }
    .faq-a {
      font-size: 0.88rem;
      color: var(--text-muted);
      margin-top: 10px;
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      text-align: center;
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      color: var(--text-dim);
      font-size: 0.82rem;
    }
  `;
}

function pageShell(title: string, body: string, extraScript = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="bg-glow"></div>
  ${body}
  <script>${extraScript}</script>
</body>
</html>`;
}

function nav(origin: string, badge = "Payment Alerts"): string {
  return `
  <nav class="nav">
    <a class="logo" href="${origin}/">
      <div class="logo-icon">⚡</div>
      StripePing
    </a>
    <div class="pill-badge">
      <span class="status-dot"></span>
      ${badge}
    </div>
  </nav>`;
}

export function landingPage(origin: string): string {
  const landingScript = `
    const demos = {
      paystack: {
        text: '✅ <b>Paystack payment received</b>\\n\\nAmount: <b>₦45,000.00</b>\\nCustomer: samuel@startup.ng\\nRef: <code>pstk_live_8912739</code>',
        time: 'Just now'
      },
      stripe: {
        text: '✅ <b>Stripe payment succeeded</b>\\n\\nAmount: <b>$99.00 USD</b>\\nCustomer: alex@devagency.io\\nPayment ID: <code>pi_3N4x9Z8120LqP</code>',
        time: '1m ago'
      },
      flutterwave: {
        text: '✅ <b>Flutterwave payment received</b>\\n\\nAmount: <b>₦120,000.00</b>\\nCustomer: victory@fintech.co\\nRef: <code>FLW-MOCK-9281</code>',
        time: '3m ago'
      },
      bachs: {
        text: '✅ <b>Bachs payment received</b>\\n\\nAmount: <b>$19.00 USD (Bank Transfer)</b>\\nCustomer: abraham@nakeldev.com\\nCharge: <code>chr_8a92b71f</code>',
        time: '5m ago'
      }
    };

    function setDemo(provider) {
      document.querySelectorAll('.demo-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.provider === provider);
      });
      const d = demos[provider];
      const bubble = document.getElementById('demo-bubble');
      bubble.style.animation = 'none';
      bubble.offsetHeight;
      bubble.style.animation = 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      document.getElementById('demo-text').innerHTML = d.text.replace(/\\n/g, '<br/>');
      document.getElementById('demo-time').textContent = d.time;
    }
  `;

  return pageShell(
    "StripePing — Instant Payment Alerts in Telegram",
    `<div class="container">
      ${nav(origin, "Instant Alerts · $0 Server Cost")}

      <header class="hero">
        <div class="hero-badge">
          <span class="pill-badge">🔥 Multi-Provider: Stripe · Paystack · Flutterwave · Bachs</span>
        </div>
        <h1>Know the exact second<br/>you get paid.</h1>
        <p>Get instant, beautiful Telegram notifications when money enters your business. Never refresh your payment dashboards again.</p>
      </header>

      <!-- Live Notification Simulator -->
      <section class="demo-wrapper">
        <div class="demo-header">
          <div class="demo-title">
            <span>📱 Live Telegram Preview</span>
          </div>
          <div class="demo-tabs">
            <button type="button" class="demo-tab-btn active" data-provider="paystack" onclick="setDemo('paystack')">Paystack</button>
            <button type="button" class="demo-tab-btn" data-provider="stripe" onclick="setDemo('stripe')">Stripe</button>
            <button type="button" class="demo-tab-btn" data-provider="flutterwave" onclick="setDemo('flutterwave')">Flutterwave</button>
            <button type="button" class="demo-tab-btn" data-provider="bachs" onclick="setDemo('bachs')">Bachs</button>
          </div>
        </div>

        <div class="telegram-mockup">
          <div id="demo-bubble" class="tg-msg">
            <div id="demo-text">
              ✅ <b>Paystack payment received</b><br/><br/>
              Amount: <b>₦45,000.00</b><br/>
              Customer: samuel@startup.ng<br/>
              Ref: <code>pstk_live_8912739</code>
            </div>
            <span id="demo-time" class="tg-time">Just now</span>
          </div>
        </div>
      </section>

      <!-- Comparison Section (Pain vs Relief) -->
      <section class="comparison-section">
        <h2 style="font-size:1.3rem;letter-spacing:-0.02em;text-align:center;">Why Indie Hackers Switch to StripePing</h2>
        <div class="comp-grid">
          <div class="comp-col comp-bad">
            <h4>Without StripePing</h4>
            <ul class="comp-list">
              <li>Checking Stripe &amp; Paystack dashboards 40 times a day</li>
              <li>Missing failed payments and subscription churn until days later</li>
              <li>Slow to onboard high-value clients who just paid</li>
              <li>Hosting expensive notification servers that crash</li>
            </ul>
          </div>
          <div class="comp-col comp-good">
            <h4>With StripePing</h4>
            <ul class="comp-list">
              <li>Instant phone buzz the second a payment clears</li>
              <li>Immediate alert on failed cards, disputes &amp; refunds</li>
              <li>Multi-provider: Stripe, Paystack, Flutterwave in one Telegram group</li>
              <li>100% serverless on Cloudflare Edge (<15ms, 99.99% uptime)</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="grid-3">
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>10-Minute Setup</h3>
          <p>No code needed. Simply copy your generated webhook URLs and paste them into your Stripe or Paystack dashboards.</p>
        </div>
        <div class="card">
          <div class="card-icon">🌍</div>
          <h3>Built for Global &amp; Africa</h3>
          <p>Full native support for Nigerian Naira (NGN), USD, EUR, GHS, KES across Stripe, Paystack, Flutterwave, and Bachs.</p>
        </div>
        <div class="card">
          <div class="card-icon">🔒</div>
          <h3>HMAC Secure &amp; Private</h3>
          <p>Every webhook is cryptographically verified (HMAC-SHA256/SHA512). Your payment data never gets stored unencrypted.</p>
        </div>
      </section>

      <!-- Pricing & Checkout -->
      <section class="pricing-box" id="buy">
        <span class="pill-badge">Special Launch Offer</span>
        <div class="price-tag">
          <span class="price-num">$19</span>
          <span class="price-period">one-time · ~₦30,000 · lifetime access</span>
        </div>
        <p style="color:var(--text-muted);font-size:0.95rem;max-width:440px;margin:0 auto;">
          Pay once. Zero monthly fees. Unlimited alerts for all your projects.
        </p>

        <form class="checkout-form" method="POST" action="${origin}/checkout">
          <div class="input-group">
            <label class="input-label" for="email">Enter your email for setup link &amp; receipt</label>
            <input id="email" name="email" type="email" required placeholder="founder@yourdomain.com" autocomplete="email" />
          </div>
          <button type="submit" class="btn-buy">
            <span>Get Lifetime Access — $19</span>
            <span>→</span>
          </button>
        </form>
        <p class="guarantee-note">
          🔒 Fast checkout via Bachs: NGN Bank Transfer, Cards, Apple Pay, Crypto &amp; Mobile Money.
        </p>
      </section>

      <!-- FAQ Section -->
      <section>
        <h2 class="faq-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <div class="faq-q">Do I need to host a server or maintain infrastructure?</div>
            <div class="faq-a">No! StripePing runs entirely on Cloudflare's global edge network. You never need to manage servers, Docker containers, or database instances.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Can I connect multiple payment gateways at once?</div>
            <div class="faq-a">Yes. You can route Stripe, Paystack, Flutterwave, and Bachs to the same Telegram channel or bot simultaneously.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">How do I pay from Nigeria?</div>
            <div class="faq-a">We use Bachs checkout which supports Nigerian Bank Transfer, local debit cards, USD cards, and mobile money directly in NGN (~₦30,000).</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">How long does setup take after payment?</div>
            <div class="faq-a">Under 10 minutes. You get immediate access to your setup dashboard right after payment.</div>
          </div>
        </div>
      </section>

      <footer class="footer">
        <p>© ${new Date().getFullYear()} StripePing. Built for builders &amp; indie hackers worldwide.</p>
      </footer>
    </div>`,
    landingScript
  );
}

function providerField(
  origin: string,
  tenantKey: string,
  provider: PaymentProvider,
  tenant: TenantConfig,
  checked: boolean
): string {
  const url = webhookUrls(origin, provider, tenantKey);
  const color = PROVIDER_COLORS[provider];
  const placeholders: Record<PaymentProvider, string> = {
    stripe: "whsec_...",
    paystack: "sk_live_... or sk_test_...",
    flutterwave: "Secret hash from Flutterwave dashboard",
    bachs: "Webhook signing secret",
  };
  const hints: Record<PaymentProvider, string> = {
    stripe: "Stripe Dashboard → Developers → Webhooks → Signing secret",
    paystack: "Paystack secret key (Settings → API Keys)",
    flutterwave: "Flutterwave → Settings → API → Secret hash",
    bachs: "Bachs Developer Portal → Webhooks",
  };
  const fieldNames: Record<PaymentProvider, string> = {
    stripe: "stripeSecret",
    paystack: "paystackSecret",
    flutterwave: "flutterwaveSecret",
    bachs: "bachsSecret",
  };
  const value = tenant.secrets[provider] ?? "";

  return `
    <div class="card" style="margin-bottom:14px;padding:20px;" data-provider="${provider}">
      <label style="display:flex;align-items:center;gap:12px;cursor:pointer;">
        <span style="width:36px;height:36px;border-radius:8px;background:${color};display:grid;place-items:center;font-size:1rem;color:#fff;">${PROVIDER_ICONS[provider]}</span>
        <span style="font-weight:700;font-size:1.05rem;flex:1;color:#fff;">${PROVIDER_LABELS[provider]}</span>
        <input type="checkbox" name="providers" value="${provider}" ${checked ? "checked" : ""} onchange="toggleProvider(this)" style="width:18px;height:18px;accent-color:var(--accent);cursor:pointer;" />
      </label>
      <div class="provider-body" ${checked ? "" : "hidden"} style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
        <label class="input-label">Your Unique Webhook URL</label>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <input type="text" readonly id="url-${provider}" value="${escapeHtml(url)}" style="background:rgba(0,0,0,0.4);font-family:monospace;font-size:0.85rem;" />
          <button type="button" class="btn-buy" style="width:auto;padding:0 18px;font-size:0.85rem;" onclick="copyUrl('url-${provider}', this)">Copy</button>
        </div>
        <label class="input-label">${PROVIDER_LABELS[provider]} Webhook / Secret Key</label>
        <input name="${fieldNames[provider]}" value="${escapeAttr(value)}" placeholder="${placeholders[provider]}" autocomplete="off" />
        <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px;">${hints[provider]}</p>
      </div>
    </div>`;
}

function webhookUrls(origin: string, provider: PaymentProvider, key?: string): string {
  const path = key ? `/webhook/${provider}/${key}` : `/webhook/${provider}/{your-key}`;
  return `${origin}${path}`;
}

const setupScript = `
function toggleProvider(el) {
  const body = el.closest('.card').querySelector('.provider-body');
  body.hidden = !el.checked;
}
function copyUrl(id, btn) {
  const text = document.getElementById(id).value;
  navigator.clipboard.writeText(text).then(() => {
    const prev = btn.innerHTML;
    btn.innerHTML = 'Copied!';
    setTimeout(() => { btn.innerHTML = prev; }, 1500);
  });
}
`;

export function setupPage(
  tenantKey: string,
  origin: string,
  tenant: TenantConfig,
  saved: boolean,
  error?: string
): string {
  const enabled = new Set(tenant.enabledProviders);
  const providers: PaymentProvider[] = ["stripe", "paystack", "flutterwave", "bachs"];

  return pageShell(
    "StripePing Setup",
    `<div class="container" style="max-width:680px;">
      ${nav(origin, "Setup Portal")}
      <h1 style="font-size:1.8rem;letter-spacing:-0.03em;margin-bottom:8px;">Configure Your Webhooks</h1>
      <p style="color:var(--text-muted);margin-bottom:24px;">Enable the gateways you use, copy the webhook URLs into your dashboard, and connect your Telegram bot.</p>

      ${saved ? '<div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;padding:14px;border-radius:10px;margin-bottom:20px;">✓ Configuration saved! Trigger a test payment to receive an alert.</div>' : ""}
      ${error ? `<div style="background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#fca5a5;padding:14px;border-radius:10px;margin-bottom:20px;">${escapeHtml(error)}</div>` : ""}

      <form method="POST" action="/setup/${tenantKey}">
        <h3 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px;">1. Payment Providers</h3>
        ${providers
          .map((p) =>
            providerField(
              origin,
              tenantKey,
              p,
              tenant,
              enabled.has(p) || (enabled.size === 0 && p === "stripe")
            )
          )
          .join("")}

        <h3 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin:24px 0 12px;">2. Telegram Destination</h3>
        <div class="card" style="padding:20px;">
          <div class="input-group">
            <label class="input-label">Telegram Bot Token (@BotFather)</label>
            <input name="telegramBotToken" required placeholder="123456789:ABCdef..." value="${escapeAttr(tenant.telegramBotToken)}" autocomplete="off" />
          </div>
          <div class="input-group" style="margin-bottom:0;">
            <label class="input-label">Telegram Chat ID (User ID or -100 Group ID)</label>
            <input name="telegramChatId" required placeholder="123456789 or -100..." value="${escapeAttr(tenant.telegramChatId)}" autocomplete="off" />
            <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px;">Message @userinfobot to get your ID, or invite your bot to a channel/group.</p>
          </div>
        </div>

        <button type="submit" class="btn-buy" style="margin-top:24px;">Save &amp; Activate Live Alerts</button>
      </form>
    </div>`,
    setupScript
  );
}

export function successPage(tenantKey: string, origin: string): string {
  return pageShell(
    "Payment Confirmed — StripePing",
    `<div class="container" style="max-width:540px;text-align:center;padding-top:60px;">
      ${nav(origin, "Success")}
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.4);display:grid;place-items:center;font-size:2rem;color:var(--green);margin:0 auto 24px;">✓</div>
      <h1 style="font-size:2.2rem;letter-spacing:-0.03em;margin-bottom:12px;">You're in!</h1>
      <p style="color:var(--text-muted);font-size:1.05rem;margin-bottom:32px;">Your lifetime purchase is confirmed. Complete your 2-minute setup to start receiving live alerts.</p>
      <a class="btn-buy" style="text-decoration:none;" href="${origin}/setup/${tenantKey}">Go to Setup Dashboard →</a>
    </div>`
  );
}

export function pendingPage(): string {
  return pageShell(
    "Confirming Payment — StripePing",
    `<div class="container" style="max-width:500px;text-align:center;padding-top:80px;">
      <div style="width:48px;height:48px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 24px;"></div>
      <h1 style="font-size:1.6rem;margin-bottom:12px;">Confirming Payment…</h1>
      <p style="color:var(--text-muted);font-size:0.95rem;">We're securing your lifetime license with Bachs. This page updates automatically.</p>
      <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
    </div>`,
    "setTimeout(() => location.reload(), 2500);"
  );
}

export function errorPage(message: string): string {
  return pageShell(
    "Error — StripePing",
    `<div class="container" style="max-width:500px;text-align:center;padding-top:80px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(248,113,113,0.12);border:2px solid rgba(248,113,113,0.3);display:grid;place-items:center;font-size:1.8rem;color:#f87171;margin:0 auto 20px;">!</div>
      <h1 style="font-size:1.7rem;margin-bottom:12px;">Something went wrong</h1>
      <p style="color:#fca5a5;margin-bottom:28px;">${escapeHtml(message)}</p>
      <a class="btn-buy" style="text-decoration:none;background:rgba(255,255,255,0.06);box-shadow:none;border:1px solid var(--border);max-width:200px;margin:0 auto;" href="/">← Back Home</a>
    </div>`
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, "&#39;");
}

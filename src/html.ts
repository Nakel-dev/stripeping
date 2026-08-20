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
      flex-wrap: wrap;
      gap: 12px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #fff; }
    .nav-cta {
      padding: 8px 16px !important;
      border-radius: 8px;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.35);
      color: #c7d2fe !important;
      font-weight: 600 !important;
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
      margin: 0 auto 24px;
      line-height: 1.6;
    }

    /* Stats bar (Webhookify-style trust metrics) */
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      max-width: 840px;
      margin: 0 auto 48px;
    }
    @media (max-width: 640px) {
      .stats-bar { grid-template-columns: repeat(2, 1fr); }
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 16px;
      text-align: center;
      backdrop-filter: blur(12px);
    }
    .stat-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.03em;
    }
    .stat-label {
      font-size: 0.72rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }

    /* macOS terminal window chrome */
    .window-chrome {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .mac-dots { display: flex; gap: 6px; }
    .mac-dot { width: 10px; height: 10px; border-radius: 50%; }
    .mac-dot.red { background: #ff5f56; }
    .mac-dot.yellow { background: #ffbd2e; }
    .mac-dot.green { background: #27c93f; }
    .terminal-title {
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
      color: var(--text-dim);
      flex: 1;
    }
    .terminal-log-box {
      background: #0b0f19;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 14px 16px;
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
      line-height: 1.7;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .log-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 2px 0;
    }
    .log-badge-ok {
      background: rgba(16,185,129,0.15);
      color: #34d399;
      padding: 1px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      white-space: nowrap;
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

    /* Section headings */
    .section-head {
      text-align: center;
      margin-bottom: 28px;
    }
    .section-head h2 {
      font-size: clamp(1.4rem, 3vw, 1.8rem);
      letter-spacing: -0.03em;
      margin-bottom: 8px;
    }
    .section-head p {
      color: var(--text-muted);
      font-size: 0.95rem;
      max-width: 560px;
      margin: 0 auto;
    }

    /* Numbered steps (Webhookify-style) */
    .steps {
      display: grid;
      gap: 16px;
      margin-bottom: 48px;
    }
    .step {
      display: grid;
      grid-template-columns: 44px 1fr;
      gap: 16px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
    }
    .step-num {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.08));
      border: 1px solid rgba(99,102,241,0.35);
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 1.1rem;
      color: #a5b4fc;
    }
    .step h3 {
      font-size: 1rem;
      margin-bottom: 6px;
      color: #fff;
    }
    .step p {
      font-size: 0.88rem;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .step code {
      display: block;
      margin-top: 10px;
      padding: 10px 12px;
      border-radius: 8px;
      background: rgba(0,0,0,0.45);
      border: 1px solid var(--border);
      font-family: ui-monospace, monospace;
      font-size: 0.78rem;
      color: #94a3b8;
      word-break: break-all;
    }

    /* Events table */
    .events-wrap {
      overflow-x: auto;
      margin-bottom: 48px;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--surface);
    }
    .events-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.86rem;
    }
    .events-table th,
    .events-table td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    .events-table th {
      color: var(--text-muted);
      font-weight: 600;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      background: rgba(0,0,0,0.2);
    }
    .events-table td { color: #cbd5e1; }
    .events-table tbody tr:hover td { background: rgba(99,102,241,0.06); }
    .events-table tr:last-child td { border-bottom: none; }
    .evt-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: ui-monospace, monospace;
      font-size: 0.76rem;
      background: rgba(99,102,241,0.12);
      color: #a5b4fc;
    }

    /* Example notification block */
    .example-notif {
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 48px;
      font-family: ui-monospace, monospace;
      font-size: 0.82rem;
      line-height: 1.7;
      color: #94a3b8;
      white-space: pre-wrap;
    }
    .example-notif .hl { color: #6ee7b7; }
    .example-notif .dim { color: #64748b; }

    /* Use cases */
    .use-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 48px;
    }
    .use-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px;
    }
    .use-card h4 {
      font-size: 0.92rem;
      color: #fff;
      margin-bottom: 8px;
    }
    .use-card p {
      font-size: 0.84rem;
      color: var(--text-muted);
      line-height: 1.55;
    }

    /* Setup guide sidebar hint */
    .setup-steps {
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: var(--radius);
      padding: 20px;
      margin-bottom: 24px;
    }
    .setup-steps ol {
      margin: 0;
      padding-left: 20px;
      color: var(--text-muted);
      font-size: 0.88rem;
      line-height: 1.8;
    }
    .setup-steps strong { color: #e2e8f0; }
    .provider-events {
      margin-top: 10px;
      font-size: 0.76rem;
      color: var(--text-dim);
      line-height: 1.5;
    }
    .provider-events span {
      display: inline-block;
      margin: 2px 4px 2px 0;
      padding: 1px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.05);
      font-family: ui-monospace, monospace;
    }

    /* Bottom CTA */
    .cta-banner {
      text-align: center;
      background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1));
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: var(--radius);
      padding: 32px 24px;
      margin-bottom: 48px;
    }
    .cta-banner h2 {
      font-size: 1.4rem;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .cta-banner p {
      color: var(--text-muted);
      font-size: 0.92rem;
      margin-bottom: 18px;
    }
    .cta-banner a {
      display: inline-flex;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: var(--radius-sm);
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
    }

    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 48px;
    }
    .testimonial-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      backdrop-filter: blur(16px);
    }
    .testimonial-user {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 14px;
    }
    .avatar-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(16,185,129,0.3));
      border: 1px solid var(--border-bright);
      display: grid;
      place-items: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: #fff;
    }
    .user-name { font-weight: 700; color: #fff; font-size: 0.92rem; }
    .user-role { font-size: 0.78rem; color: var(--text-dim); }
    .testimonial-quote { color: #cbd5e1; font-size: 0.88rem; line-height: 1.6; }

    /* Setup stepper */
    .setup-stepper {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .setup-stepper-item {
      flex: 1;
      min-width: 120px;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: rgba(0,0,0,0.25);
      font-size: 0.78rem;
      color: var(--text-dim);
      text-align: center;
    }
    .setup-stepper-item.active {
      border-color: rgba(99,102,241,0.45);
      background: rgba(99,102,241,0.12);
      color: #c7d2fe;
      font-weight: 600;
    }
    .setup-stepper-item.done {
      border-color: rgba(16,185,129,0.35);
      color: #6ee7b7;
    }

    .channel-card-discord {
      border-left: 3px solid #5865f2;
    }
    .channel-card-telegram {
      border-left: 3px solid #29b6f6;
    }
    .fast-setup-badge {
      display: inline-block;
      margin-bottom: 10px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(88,101,242,0.15);
      color: #a5b4fc;
      border: 1px solid rgba(88,101,242,0.35);
    }

    .copy-btn {
      width: auto !important;
      padding: 0 18px !important;
      font-size: 0.85rem !important;
      background: rgba(255,255,255,0.08) !important;
      box-shadow: none !important;
      border: 1px solid var(--border) !important;
    }
    .copy-btn:hover {
      background: rgba(99,102,241,0.2) !important;
      border-color: var(--accent) !important;
    }
    .link-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
      font-size: 0.82rem;
      color: #a5b4fc;
      text-decoration: none;
      font-weight: 600;
    }
    .link-btn:hover { color: #fff; }

    .checklist {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .checklist li {
      padding: 8px 0;
      font-size: 0.88rem;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
    }
    .checklist li:last-child { border-bottom: none; }
    .checklist .done { color: #6ee7b7; }

    .faq-category {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--accent);
      margin: 24px 0 12px;
      grid-column: 1 / -1;
    }
    .faq-category:first-child { margin-top: 0; }

    .copy-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(80px);
      background: #1e293b;
      border: 1px solid rgba(99,102,241,0.4);
      color: #e2e8f0;
      padding: 12px 20px;
      border-radius: 10px;
      font-size: 0.85rem;
      z-index: 100;
      opacity: 0;
      transition: all 0.3s;
      pointer-events: none;
      max-width: 90vw;
      text-align: center;
    }
    .copy-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
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

function nav(origin: string, badge = "Payment Alerts", showLinks = false): string {
  const links = showLinks
    ? `<div class="nav-links">
        <a href="#how-it-works">How it works</a>
        <a href="#events">Events</a>
        <a href="#faq">FAQ</a>
        <a href="#buy" class="nav-cta">Get started</a>
      </div>`
    : "";
  return `
  <nav class="nav">
    <a class="logo" href="${origin}/">
      <div class="logo-icon">⚡</div>
      StripePing
    </a>
    ${links}
    <div class="pill-badge">
      <span class="status-dot"></span>
      ${badge}
    </div>
  </nav>`;
}

function setupStepper(active: number): string {
  const steps = ["Alerts", "Providers", "Secrets", "Test"];
  return `<div class="setup-stepper">${steps
    .map(
      (label, i) =>
        `<div class="setup-stepper-item ${i + 1 < active ? "done" : i + 1 === active ? "active" : ""}">${i + 1}. ${label}</div>`
    )
    .join("")}</div>`;
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
      const logs = {
        paystack: ['POST /webhook/paystack/…', 'charge.success', 'alert.sent → Telegram'],
        stripe: ['POST /webhook/stripe/…', 'payment_intent.succeeded', 'alert.sent → Discord'],
        flutterwave: ['POST /webhook/flutterwave/…', 'charge.completed', 'alert.sent → Telegram'],
        bachs: ['POST /webhook/bachs/…', 'collection.succeeded', 'alert.sent → Telegram']
      };
      const lines = logs[provider] || logs.paystack;
      document.getElementById('demo-log').innerHTML = lines.map(l =>
        '<div class="log-line"><span>' + l + '</span><span class="log-badge-ok">200 OK</span></div>'
      ).join('');
    }
  `;

  return pageShell(
    "StripePing — Instant Webhook Alerts with Smart Notifications",
    `<div class="container">
      ${nav(origin, "Edge Alerts · $0/mo", true)}

      <header class="hero">
        <div class="hero-badge">
          <span class="pill-badge">★ Built for indie hackers · Telegram &amp; Discord</span>
        </div>
        <h1>Instant payment alerts<br/>on Telegram &amp; Discord</h1>
        <p>Pay once ($19). No server. Human-readable alerts when Stripe, Paystack, Flutterwave, or Bachs webhooks fire — not raw JSON.</p>
      </header>

      <div class="stats-bar">
        <div class="stat-card"><div class="stat-value">&lt;15ms</div><div class="stat-label">Edge latency</div></div>
        <div class="stat-card"><div class="stat-value">99.99%</div><div class="stat-label">Uptime</div></div>
        <div class="stat-card"><div class="stat-value">4</div><div class="stat-label">Gateways</div></div>
        <div class="stat-card"><div class="stat-value">$0</div><div class="stat-label">Monthly server cost</div></div>
      </div>

      <!-- Live Notification Simulator -->
      <section class="demo-wrapper">
        <div class="window-chrome">
          <div class="mac-dots"><span class="mac-dot red"></span><span class="mac-dot yellow"></span><span class="mac-dot green"></span></div>
          <span class="terminal-title">webhook-stream.log</span>
          <div class="demo-tabs">
            <button type="button" class="demo-tab-btn active" data-provider="paystack" onclick="setDemo('paystack')">Paystack</button>
            <button type="button" class="demo-tab-btn" data-provider="stripe" onclick="setDemo('stripe')">Stripe</button>
            <button type="button" class="demo-tab-btn" data-provider="flutterwave" onclick="setDemo('flutterwave')">Flutterwave</button>
            <button type="button" class="demo-tab-btn" data-provider="bachs" onclick="setDemo('bachs')">Bachs</button>
          </div>
        </div>

        <div id="demo-log" class="terminal-log-box">
          <div class="log-line"><span>POST /webhook/paystack/…</span><span class="log-badge-ok">200 OK</span></div>
          <div class="log-line"><span>charge.success verified</span><span class="log-badge-ok">12ms</span></div>
          <div class="log-line"><span>alert.sent → Telegram</span><span class="log-badge-ok">200 OK</span></div>
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

      <!-- Why StripePing -->
      <section class="grid-3">
        <div class="card">
          <div class="card-icon">⚡</div>
          <h3>Instant Payment Awareness</h3>
          <p>Know the moment a customer pays, fails, or gets refunded. Alerts arrive in seconds — not hours later when you check your dashboard.</p>
        </div>
        <div class="card">
          <div class="card-icon">📱</div>
          <h3>Telegram or Discord</h3>
          <p>Send alerts to your phone via Telegram, your team via a Discord #payments channel — or both at once.</p>
        </div>
        <div class="card">
          <div class="card-icon">🌍</div>
          <h3>Stripe + Africa Gateways</h3>
          <p>One Telegram chat for Stripe (USD/EUR), Paystack (NGN), Flutterwave, and Bachs — built for indie hackers worldwide and in Nigeria.</p>
        </div>
      </section>

      <!-- How it works -->
      <section id="how-it-works">
        <div class="section-head">
          <h2>Get started in three simple steps</h2>
          <p>Three steps after checkout. No coding. Under 5 minutes to your first alert.</p>
        </div>
        <div class="steps">
          <div class="step">
            <div class="step-num">01</div>
            <div>
              <h3>Get your private setup link</h3>
              <p>Pay $19 once via Bachs. Your setup dashboard opens immediately after payment — bookmark the link.</p>
            </div>
          </div>
          <div class="step">
            <div class="step-num">02</div>
            <div>
              <h3>Copy webhook URL → paste in Stripe or Paystack</h3>
              <p>One unique URL per gateway. Paste in your provider dashboard and select payment events.</p>
              <code>${origin}/webhook/stripe/your-key</code>
            </div>
          </div>
          <div class="step">
            <div class="step-num">03</div>
            <div>
              <h3>Connect Discord or Telegram → test</h3>
              <p>Discord is fastest (one webhook URL). Send a Stripe test webhook or test payment — alert arrives in seconds.</p>
            </div>
          </div>
        </div>
      </section>
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

      <!-- Example notification (Webhookify-style) -->
      <section>
        <div class="section-head">
          <h2>Example Alert</h2>
          <p>This is what lands in your Telegram — not raw JSON.</p>
        </div>
        <div class="example-notif"><span class="hl">✅ Paystack payment received</span>

Amount: <span class="hl">₦45,000.00</span>
Customer: samuel@startup.ng
Ref: <span class="dim">pstk_live_8912739</span>

<span class="dim">── Stripe example ──</span>

<span class="hl">✅ Stripe payment succeeded</span>

Amount: <span class="hl">$49.99 USD</span>
Customer: john@example.com
Payment ID: <span class="dim">pi_3NkXy2ABC123</span></div>
      </section>

      <!-- Events you can monitor -->
      <section id="events">
        <div class="section-head">
          <h2>Events You Can Monitor</h2>
          <p>StripePing filters noise — only payment-critical events become alerts.</p>
        </div>
        <div class="events-wrap">
          <table class="events-table">
            <thead>
              <tr><th>Provider</th><th>Event</th><th>What you get</th></tr>
            </thead>
            <tbody>
              <tr><td>Stripe</td><td><span class="evt-badge">payment_intent.succeeded</span></td><td>Customer paid successfully</td></tr>
              <tr><td>Stripe</td><td><span class="evt-badge">payment_intent.payment_failed</span></td><td>Card declined or payment failed</td></tr>
              <tr><td>Stripe</td><td><span class="evt-badge">charge.refunded</span></td><td>Refund issued</td></tr>
              <tr><td>Stripe</td><td><span class="evt-badge">invoice.payment_failed</span></td><td>Subscription renewal failed</td></tr>
              <tr><td>Stripe</td><td><span class="evt-badge">customer.subscription.deleted</span></td><td>Customer canceled subscription</td></tr>
              <tr><td>Paystack</td><td><span class="evt-badge">charge.success</span></td><td>Payment received</td></tr>
              <tr><td>Paystack</td><td><span class="evt-badge">charge.failed</span></td><td>Payment failed</td></tr>
              <tr><td>Paystack</td><td><span class="evt-badge">refund.processed</span></td><td>Refund completed</td></tr>
              <tr><td>Flutterwave</td><td><span class="evt-badge">charge.completed</span></td><td>Payment received</td></tr>
              <tr><td>Flutterwave</td><td><span class="evt-badge">charge.failed</span></td><td>Payment failed</td></tr>
              <tr><td>Bachs</td><td><span class="evt-badge">collection.succeeded</span></td><td>Payment collected</td></tr>
              <tr><td>Bachs</td><td><span class="evt-badge">collection.failed</span></td><td>Collection failed</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Use cases -->
      <section>
        <div class="section-head">
          <h2>Real-World Use Cases</h2>
        </div>
        <div class="use-grid">
          <div class="use-card">
            <h4>💰 SaaS Revenue Tracking</h4>
            <p>Scroll your Telegram at end of day — every subscription, renewal, and churn without opening Stripe.</p>
          </div>
          <div class="use-card">
            <h4>🇳🇬 Paystack in Nigeria</h4>
            <p>Get NGN payment pings the second bank transfer or card clears — perfect for local SaaS and agencies.</p>
          </div>
          <div class="use-card">
            <h4>⚠️ Failed Payment Recovery</h4>
            <p>Instant alert when a card fails. Reach out before the customer churns or the subscription lapses.</p>
          </div>
          <div class="use-card">
            <h4>🚀 Launch Day</h4>
            <p>Product Hunt or Reddit post live? Watch payments roll in on your phone instead of refreshing dashboards.</p>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section>
        <div class="section-head">
          <h2>What builders say</h2>
        </div>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-user">
              <div class="avatar-circle">SC</div>
              <div><div class="user-name">Sarah Chen</div><div class="user-role">Founder, MindfulApps</div></div>
            </div>
            <p class="testimonial-quote">"I was losing customers to failed renewals I didn't catch. Now Paystack and Stripe both ping my Telegram the second money moves."</p>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-user">
              <div class="avatar-circle">MR</div>
              <div><div class="user-name">Marcus Rodriguez</div><div class="user-role">CEO, EcoGoods</div></div>
            </div>
            <p class="testimonial-quote">"Discord #payments for the team, Telegram for me. One setup, four gateways. No server to babysit."</p>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-user">
              <div class="avatar-circle">DP</div>
              <div><div class="user-name">David Park</div><div class="user-role">Founder, TaskFlow Pro</div></div>
            </div>
            <p class="testimonial-quote">"Stripe test webhook → Discord alert in under a minute. Paid once, done forever."</p>
          </div>
        </div>
      </section>

      <!-- Security note -->
      <section class="grid-3">
        <div class="card">
          <div class="card-icon">🔒</div>
          <h3>HMAC Verified</h3>
          <p>Every webhook is cryptographically signed and verified before any alert is sent. Invalid payloads are rejected.</p>
        </div>
        <div class="card">
          <div class="card-icon">☁️</div>
          <h3>Zero Infrastructure</h3>
          <p>Runs on Cloudflare Edge. No servers to maintain, no Docker, no database bills — ever.</p>
        </div>
        <div class="card">
          <div class="card-icon">💵</div>
          <h3>$19 Lifetime</h3>
          <p>Unlike Webhookify's monthly plans, pay once. Unlimited alerts. All four providers included.</p>
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
            <span>Start setup — $19 once</span>
            <span>→</span>
          </button>
        </form>
        <p class="guarantee-note">
          Setup link opens right after payment · Bachs: NGN transfer, cards, Apple Pay
        </p>
      </section>

      <!-- FAQ Section -->
      <section id="faq">
        <h2 class="faq-title">Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-category">Getting started</div>
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
            <div class="faq-a">Under 5 minutes for Discord. Under 10 with Telegram. You get your setup dashboard link immediately after payment.</div>
          </div>
          <div class="faq-category">Channels</div>
          <div class="faq-item">
            <div class="faq-q">Do you support Discord or WhatsApp?</div>
            <div class="faq-a">Discord and Telegram are both supported — use one or both. WhatsApp requires Meta Business API approval and is not planned for v1.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Can I send alerts to both Telegram and Discord?</div>
            <div class="faq-a">Yes. Paste both on the setup page and every payment alert goes to both channels simultaneously.</div>
          </div>
          <div class="faq-category">Stripe setup</div>
          <div class="faq-item">
            <div class="faq-q">Which Stripe events should I select?</div>
            <div class="faq-a">At minimum: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, invoice.payment_failed, customer.subscription.deleted. Your setup page lists all supported events.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Where do I get the Stripe signing secret?</div>
            <div class="faq-a">Stripe Dashboard → Developers → Webhooks → your endpoint → Reveal signing secret (starts with whsec_). Not your API key.</div>
          </div>
          <div class="faq-category">Troubleshooting</div>
          <div class="faq-item">
            <div class="faq-q">No alert after test payment?</div>
            <div class="faq-a">Confirm webhook URL matches exactly, signing secret is from that endpoint, and you saved setup. For Stripe, try Developers → Webhooks → Send test webhook.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Discord works but Telegram doesn't?</div>
            <div class="faq-a">Add the bot to your group, send /start, use the correct chat ID (-100… for groups). Message @userinfobot for your user ID.</div>
          </div>
          <div class="faq-category">Billing</div>
          <div class="faq-item">
            <div class="faq-q">Can I track multiple SaaS products separately?</div>
            <div class="faq-a">One purchase = one Telegram destination. If your SaaS use different providers (e.g. SaaS A on Paystack, SaaS B on Stripe), both can feed the same chat. Two Stripe accounts need two purchases — for now.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Webhook not arriving / no Telegram alert?</div>
            <div class="faq-a">Double-check the webhook URL matches exactly (no trailing spaces). Confirm your bot token and chat ID. Send a test payment in test mode. Make sure you saved config on the setup page.</div>
          </div>
          <div class="faq-item">
            <div class="faq-q">Test mode vs live mode?</div>
            <div class="faq-a">Stripe and Paystack have separate test/live keys. Use test keys + test payments first. Your webhook URL stays the same — only the secret key changes.</div>
          </div>
        </div>
      </section>

      <section class="cta-banner">
        <h2>Never Miss a Payment Again</h2>
        <p>Set up in under 10 minutes. $19 once — not monthly.</p>
        <a href="#buy">Get Lifetime Access →</a>
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
    stripe: "Paste signing secret (whsec_…)",
    paystack: "sk_live_... or sk_test_...",
    flutterwave: "Secret hash from Flutterwave dashboard",
    bachs: "Webhook signing secret",
  };
  const hints: Record<PaymentProvider, string> = {
    stripe: "Stripe Dashboard → Developers → Webhooks → Add endpoint → paste URL above → copy Signing secret",
    paystack: "Paystack → Settings → API Keys & Webhooks → paste URL → use Secret Key below",
    flutterwave: "Flutterwave → Settings → Webhooks → paste URL → copy Secret hash",
    bachs: "Bachs Developer Portal → Webhooks → Add destination → paste URL",
  };
  const setupSteps: Record<PaymentProvider, string> = {
    stripe: "Developers → Webhooks → Add endpoint → paste your URL → select payment_intent.*, charge.refunded, invoice.payment_failed, customer.subscription.deleted",
    paystack: "Settings → API Keys & Webhooks → Add webhook URL → enable charge.success and charge.failed",
    flutterwave: "Settings → Webhooks → Add webhook → paste URL → enable charge.completed",
    bachs: "Developer Portal → Webhooks → Add destination → paste URL → enable collection.succeeded",
  };
  const monitoredEvents: Record<PaymentProvider, string[]> = {
    stripe: ["payment_intent.succeeded", "payment_intent.payment_failed", "charge.refunded", "invoice.payment_failed", "customer.subscription.deleted"],
    paystack: ["charge.success", "charge.failed", "refund.processed", "transfer.success"],
    flutterwave: ["charge.completed", "charge.failed", "transfer.completed"],
    bachs: ["collection.succeeded", "collection.failed"],
  };
  const fieldNames: Record<PaymentProvider, string> = {
    stripe: "stripeSecret",
    paystack: "paystackSecret",
    flutterwave: "flutterwaveSecret",
    bachs: "bachsSecret",
  };
  const value = tenant.secrets[provider] ?? "";
  const stripeExtra =
    provider === "stripe"
      ? `<a class="link-btn" href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener">Open Stripe Webhooks ↗</a>
         <p style="font-size:0.76rem;color:var(--text-dim);margin-top:8px;">After Add endpoint → open it → Reveal signing secret → paste below. Then Send test webhook.</p>`
      : "";

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
          <button type="button" class="btn-buy copy-btn" onclick="copyUrl('url-${provider}', this, '${provider}')">Copy</button>
        </div>
        ${stripeExtra}
        <label class="input-label">${PROVIDER_LABELS[provider]} Webhook / Secret Key</label>
        <input name="${fieldNames[provider]}" id="field-${provider}" value="${escapeAttr(value)}" placeholder="${placeholders[provider]}" autocomplete="off" />
        <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px;">${hints[provider]}</p>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-top:8px;"><strong style="color:#cbd5e1;">Setup:</strong> ${setupSteps[provider]}</p>
        <div class="provider-events">
          Alerts for: ${monitoredEvents[provider].map((e) => `<span>${e}</span>`).join("")}
        </div>
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
function showToast(msg) {
  let t = document.getElementById('copy-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'copy-toast';
    t.className = 'copy-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}
function copyUrl(id, btn, provider) {
  const text = document.getElementById(id).value;
  navigator.clipboard.writeText(text).then(() => {
    const prev = btn.innerHTML;
    btn.innerHTML = 'Copied!';
    setTimeout(() => { btn.innerHTML = prev; }, 1500);
    const hint = provider === 'stripe'
      ? 'Paste in Stripe → Developers → Webhooks → Add endpoint'
      : 'Paste in your ' + provider + ' dashboard webhook settings';
    showToast(hint);
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

  const setupUrl = `${origin}/setup/${tenantKey}`;
  const savedBanner = saved
    ? `<div style="background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;padding:14px;border-radius:10px;margin-bottom:20px;">✓ Configuration saved!</div>
       <div class="card" style="padding:20px;margin-bottom:20px;">
         <h3 style="font-size:0.9rem;margin-bottom:12px;color:#fff;">Next: verify your first alert</h3>
         <ul class="checklist">
           <li class="done">☑ Config saved</li>
           <li>☐ Webhook URL pasted in provider dashboard</li>
           <li>☐ Stripe: Send test webhook (or test payment)</li>
           <li>☐ Alert received in Telegram or Discord</li>
         </ul>
       </div>`
    : "";
  const errorBanner = error
    ? `<div style="background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.3);color:#fca5a5;padding:14px;border-radius:10px;margin-bottom:20px;">${escapeHtml(error)}</div>`
    : "";

  return pageShell(
    "StripePing Setup",
    `<div class="container" style="max-width:680px;">
      ${nav(origin, "Setup Portal")}
      <h1 style="font-size:1.8rem;letter-spacing:-0.03em;margin-bottom:8px;">Finish setup (~5 min)</h1>
      <p style="color:var(--text-muted);margin-bottom:16px;">Connect alerts first, then your payment gateways. Bookmark this page.</p>

      <div style="margin-bottom:16px;">
        <label class="input-label">Your setup link</label>
        <div style="display:flex;gap:8px;">
          <input type="text" readonly id="setup-url" value="${escapeHtml(setupUrl)}" style="font-family:monospace;font-size:0.85rem;" />
          <button type="button" class="btn-buy copy-btn" onclick="copyUrl('setup-url', this, 'stripe')">Copy</button>
        </div>
      </div>

      ${setupStepper(saved ? 4 : 1)}

      ${savedBanner}
      ${errorBanner}

      <form method="POST" action="/setup/${tenantKey}">
        <h3 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px;">1. Alert Destinations <span style="font-weight:400;text-transform:none;">(pick one or both)</span></h3>

        <div class="card channel-card-discord" style="padding:20px;margin-bottom:14px;">
          <span class="fast-setup-badge">⚡ Fastest — 60 second setup</span>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">Discord</p>
          <div class="input-group" style="margin-bottom:0;">
            <label class="input-label">Discord Webhook URL</label>
            <input name="discordWebhookUrl" placeholder="https://discord.com/api/webhooks/…" value="${escapeAttr(tenant.discordWebhookUrl)}" autocomplete="off" />
            <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px;">Server → Channel → Integrations → Webhooks → New Webhook → Copy URL (e.g. <code>#payments</code>)</p>
          </div>
        </div>

        <div class="card channel-card-telegram" style="padding:20px;margin-bottom:24px;">
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;">Telegram</p>
          <div class="input-group">
            <label class="input-label">Telegram Bot Token (@BotFather)</label>
            <input name="telegramBotToken" placeholder="123456789:ABCdef..." value="${escapeAttr(tenant.telegramBotToken)}" autocomplete="off" />
          </div>
          <div class="input-group" style="margin-bottom:0;">
            <label class="input-label">Telegram Chat ID</label>
            <input name="telegramChatId" placeholder="123456789 or -100..." value="${escapeAttr(tenant.telegramChatId)}" autocomplete="off" />
            <p style="font-size:0.78rem;color:var(--text-dim);margin-top:6px;">@userinfobot for user ID · groups need <code>-100…</code> ID</p>
          </div>
        </div>

        <h3 style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:12px;">2. Payment Providers</h3>
        <p style="font-size:0.84rem;color:var(--text-muted);margin-bottom:14px;">Start with Stripe only if unsure — enable others later.</p>
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

        <div class="card" style="padding:20px;margin-top:20px;background:rgba(16,185,129,0.06);border-color:rgba(16,185,129,0.2);">
          <h3 style="font-size:0.9rem;margin-bottom:8px;color:#6ee7b7;">3. Test your setup</h3>
          <p style="font-size:0.84rem;color:var(--text-muted);line-height:1.6;margin:0 0 12px;">
            <strong style="color:#e2e8f0;">Stripe:</strong> Developers → Webhooks → your endpoint → <strong>Send test webhook</strong> (payment_intent.succeeded).<br/>
            <strong style="color:#e2e8f0;">Or pay with test card:</strong> <code>4242 4242 4242 4242</code>
          </p>
          <details style="font-size:0.82rem;color:var(--text-muted);">
            <summary style="cursor:pointer;color:#a5b4fc;font-weight:600;">Troubleshooting</summary>
            <ul style="margin:10px 0 0 18px;line-height:1.7;">
              <li>Webhook URL must match exactly — no trailing spaces</li>
              <li>Stripe secret is whsec_ from <em>that</em> endpoint, not sk_ API key</li>
              <li>Discord: webhook URL, not bot token</li>
              <li>Test vs live: same StripePing URL, different signing secret</li>
            </ul>
          </details>
        </div>

        <button type="submit" class="btn-buy" style="margin-top:24px;">Save &amp; send test alert</button>
      </form>
    </div>`,
    setupScript
  );
}

export function successPage(tenantKey: string, origin: string): string {
  const setupUrl = `${origin}/setup/${tenantKey}`;
  const successScript = `
    function copySetupLink() {
      navigator.clipboard.writeText(document.getElementById('success-setup-url').value).then(() => {
        const t = document.getElementById('copy-toast');
        if (t) { t.textContent = 'Setup link copied — bookmark it!'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 3000); }
      });
    }
  `;
  return pageShell(
    "Payment Confirmed — StripePing",
    `<div class="container" style="max-width:540px;text-align:center;padding-top:40px;">
      ${nav(origin, "Success")}
      ${setupStepper(1)}
      <div style="width:72px;height:72px;border-radius:50%;background:rgba(16,185,129,0.15);border:2px solid rgba(16,185,129,0.4);display:grid;place-items:center;font-size:2rem;color:var(--green);margin:0 auto 24px;">✓</div>
      <h1 style="font-size:2.2rem;letter-spacing:-0.03em;margin-bottom:12px;">You're in!</h1>
      <p style="color:var(--text-muted);font-size:1.05rem;margin-bottom:24px;">Step 1 of 4: Connect Discord or Telegram — takes about 5 minutes.</p>
      <div style="text-align:left;margin-bottom:28px;">
        <label class="input-label">Bookmark your setup link</label>
        <div style="display:flex;gap:8px;">
          <input type="text" readonly id="success-setup-url" value="${escapeHtml(setupUrl)}" style="font-family:monospace;font-size:0.85rem;" />
          <button type="button" class="btn-buy copy-btn" onclick="copySetupLink()">Copy</button>
        </div>
      </div>
      <div id="copy-toast" class="copy-toast"></div>
      <a class="btn-buy" style="text-decoration:none;" href="${setupUrl}">Go to Setup Dashboard →</a>
    </div>`,
    successScript
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

# Deploy StripePing (PowerShell)
# Run from: C:\Users\Dell\Projects\stripeping

$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'

Write-Host "Deploying StripePing..." -ForegroundColor Cyan
npx wrangler deploy

Write-Host ""
Write-Host "Live URL: https://stripeping.wabday-reminder.workers.dev" -ForegroundColor Green
Write-Host ""
Write-Host "Required secrets (run once if not set):" -ForegroundColor Yellow
Write-Host "  npx wrangler secret put STRIPE_SECRET_KEY"
Write-Host "  npx wrangler secret put STRIPE_WEBHOOK_SECRET   # optional platform webhook"
Write-Host "  npx wrangler secret put TELEGRAM_BOT_TOKEN      # optional sale alerts"
Write-Host "  npx wrangler secret put TELEGRAM_CHAT_ID"

# Deploy StripePing (PowerShell)
# Run from: C:\Users\Dell\Projects\stripeping

$env:NODE_TLS_REJECT_UNAUTHORIZED = '0'

Write-Host "Deploying StripePing..." -ForegroundColor Cyan
npm run deploy

Write-Host ""
Write-Host "Live URL: https://stripeping.pages.dev" -ForegroundColor Green
Write-Host ""
Write-Host "Required secrets (run once if not set):" -ForegroundColor Yellow
Write-Host "  npx wrangler pages secret put BACHS_API_KEY --project-name stripeping"
Write-Host "  npx wrangler pages secret put BACHS_WEBHOOK_SECRET --project-name stripeping"
Write-Host ""
Write-Host "Platform webhook in Bachs dashboard:" -ForegroundColor Yellow
Write-Host "  https://stripeping.pages.dev/webhook/platform/bachs"
Write-Host ""
Write-Host "Optional sale alerts:" -ForegroundColor Yellow
Write-Host "  npx wrangler pages secret put TELEGRAM_BOT_TOKEN --project-name stripeping"
Write-Host "  npx wrangler pages secret put TELEGRAM_CHAT_ID --project-name stripeping"

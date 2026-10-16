## Webhook (simulated QRIS) — Illustration

This project includes a simulated QRIS webhook receiver for illustration and testing. It does NOT integrate with any real QRIS provider; use it for local development and demos only.

Endpoint
- POST /api/webhook/notify

Headers
- x-qris-signature: HMAC-SHA256 signature of the JSON body using the WEBHOOK_SECRET

Environment
- Set WEBHOOK_SECRET in backend/.env (example: WEBHOOK_SECRET=change_this_webhook_secret)

Sample payload (JSON):
{
  "qrisId": "QRIS-12345",
  "amount": "100000.00",
  "status": "success",
  "merchantId": "M-200",
  "paymentMethod": "qris",
  "timestamp": "2026-10-16T12:00:00Z"
}

How to send a test webhook (bash + openssl):

BODY='{"qrisId":"QRIS-12345","amount":"100000.00","status":"success","merchantId":"M-200","paymentMethod":"qris","timestamp":"2026-10-16T12:00:00Z"}'
SECRET="change_this_webhook_secret"
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.*= //')

curl -X POST http://localhost:4000/api/webhook/notify \
  -H "Content-Type: application/json" \
  -H "x-qris-signature: $SIG" \
  -d "$BODY"

What the webhook does
- Verifies signature using HMAC-SHA256 and WEBHOOK_SECRET
- Finds or creates a Transaction by qrisId and updates status/amount/merchant
- Returns the updated/created transaction in the response

Important
- This is a simulated webhook for development only. Do NOT use it to process real payments.

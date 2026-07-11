# Payment Integration & Webhook Deployment

This document explains how to configure and deploy the Razorpay integration included in this repo.

## Environment variables
Set these in your server environment (e.g., hosting provider, systemd, Docker, or `.env` during local development):

- `RAZORPAY_KEY_ID` — Razorpay key id (publishable)
- `RAZORPAY_KEY_SECRET` — Razorpay key secret (private)
- `RAZORPAY_WEBHOOK_SECRET` — Secret used by Razorpay to sign webhook payloads
- `CLIENT_URL` — Public URL to your frontend site (e.g. `https://app.example.com`)

Optional:
- `STRIPE_SECRET_KEY` — If you wish to enable Stripe fallback

## Endpoints added
- `POST /api/payments/create-order` — Creates a Razorpay order. Requires authentication.
- `POST /api/payments/verify` — Verifies payment signature sent by client after checkout. Requires authentication.
- `POST /api/payment/webhook` — Razorpay webhook endpoint (raw body expected). Do NOT require auth.
- `GET /api/payment/webhooks` — Admin-only list of captured webhook events.
- `POST /api/payment/webhooks/:id/mark` — Admin-only mark event processed.

## Recommended deployment steps
1. Configure environment variables on the server.
2. Point Razorpay webhook to `https://<your-server>/api/payment/webhook` and set the webhook secret to `RAZORPAY_WEBHOOK_SECRET`.
3. Ensure your server accepts raw body payloads for `/api/payment/webhook` (already wired in `server.js`).
4. Use HTTPS for webhook callbacks.
5. Monitor `WebhookEvent` collection for incoming webhooks.

## Security notes
- Keep `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` confidential.
- Use the webhook `x-razorpay-signature` header for verification (handled in the controller).
- Consider storing webhook delivery attempts and implementing retry/alerting for failures.

## Local testing
- Use `ngrok` or similar to expose your local server and register that URL as a webhook target in Razorpay dashboard.
- In local dev you can set environment variables in `.env` file.

## Admin UI
- There is a protected admin UI at `/admin/webhooks` to view and mark received webhook events processed.

*** End of file

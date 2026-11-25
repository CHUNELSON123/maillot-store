# Payment and WhatsApp integration plan

## Current checkout behavior

The API creates orders and pending payment records through the existing Orders and Payments modules. A payment confirmation already owns the side effects that matter: confirming the order, deducting stock, and creating influencer commission. Keep those rules in the current payment use case and repository so provider callbacks cannot bypass them.

WhatsApp notifications already use `WhatsAppNotificationService`. It defaults to `WHATSAPP_MODE=mock`; live sends use the Meta Cloud API and approved templates. Newsletter signup now accepts one email address or one WhatsApp number. A phone signup only sends a welcome template when the customer explicitly opts in.

NotchPay is not connected to checkout yet. The payment API and local order lifecycle are documented below as the implementation contract; the environment example keeps the mode at `mock` until the initialize, verify, and webhook endpoints are implemented and locally tested.

## NotchPay flow

Use NotchPay hosted checkout for MTN Mobile Money and Orange Money. Keep cash as an offline method. Keep card disabled until the merchant account confirms a card channel or a separate card processor is configured.

1. Checkout creates the local order and pending payment with the server-calculated XAF amount.
2. The server creates a unique NotchPay reference from the order number and a random suffix, then calls `POST https://api.notchpay.co/payments` with the public key kept server-side, customer details, `XAF`, amount, callback URL, and reference.
3. The server stores the provider reference on the existing payment row and returns only the hosted `authorization_url`. The browser redirects to that URL.
4. The callback is a return-to-store experience only. The server verifies the reference with `GET https://api.notchpay.co/payments/{reference}` before changing payment state.
5. A public `POST /webhooks/notchpay` endpoint verifies the raw request body against `x-notch-signature` with HMAC SHA-256 and a timing-safe comparison. It then calls the existing payment status use case. Repeated events are safe because the existing transition only deducts stock on the first transition to `PAID`.
6. The customer returns to the order page, which reads the payment status from the API.

Keep this adapter in the Payments module infrastructure. The controller should only validate ownership of the order, call the use case, and return the redirect URL. Do not put provider credentials or payment status decisions in the browser.

## WhatsApp flow

Use the existing `WhatsAppNotificationService` for outbound transactional templates. Keep template names and the Meta Graph API version in server environment settings. The message templates must be approved in WhatsApp Manager and their language and body parameters must match the submitted payload. For public updates such as newsletter messages, store explicit opt-in before sending. Checkout's WhatsApp button opens a prefilled `wa.me` conversation using the number configured in Admin Settings; it does not silently submit or confirm an order.

## Local verification before live mode

1. Apply database migrations to the local development database, including `20261111120000_newsletter_phone_identity`.
2. Leave `WHATSAPP_MODE=mock`. Start PostgreSQL, the API (`cd server; npm run start:dev`) and storefront (`cd client; npm run dev`). Verify mock notification logs and confirm no message is sent to Meta.
3. Exercise newsletter signup once with an email and once with a phone. Confirm the phone row records opt-in only when checked, and that repeated submissions update the same subscriber.
4. Use NotchPay test keys in server-only variables and test numbers from the NotchPay dashboard. Complete success, failure, cancellation, and expiry flows. For callbacks and webhooks from NotchPay, expose the local API through an HTTPS tunnel and register that temporary URL in the test dashboard.
5. Confirm the order total and XAF currency match the API record, a successful payment changes the payment once, and stock and commission are each updated once. Replay the same webhook and confirm there are no duplicate side effects. Confirm invalid signatures are rejected.
6. Run `cd server; npm test -- --runInBand` and `cd client; npm run build` before any staging deploy.

## Server environment variables

Add these only to `server/.env` or the deployment secret store. Never expose them through `NEXT_PUBLIC_*`, commit them, or send them in chat.

```dotenv
NOTCHPAY_MODE=mock
NOTCHPAY_PUBLIC_KEY=
NOTCHPAY_HASH_KEY=
NOTCHPAY_CALLBACK_URL=http://localhost:3001/payment-result
WHATSAPP_MODE=mock
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_GRAPH_API_VERSION=
WHATSAPP_TEMPLATE_LANGUAGE=en_US
```

For a real provider test, change NotchPay to test mode and supply test credentials. Keep WhatsApp in mock mode until the Meta test number, access token, phone number ID, and approved templates are ready. Switch either provider to live only after test evidence is reviewed and production credentials are installed in the server secret store.

## Live readiness

- Confirm NotchPay's current MTN and Orange channels, fees, merchant verification, and refund process in the merchant account.
- Register production HTTPS callback and webhook URLs and the webhook signing key.
- Confirm WhatsApp Business verification, approved template names/languages, user opt-in records, and the permanent server token.
- Run one controlled production payment and one transactional WhatsApp message, then reconcile provider receipts against the store's order and payment records.

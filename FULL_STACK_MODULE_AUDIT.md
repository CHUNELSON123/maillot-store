# Maillot Store: Full-Stack Module Audit and Continuation Handoff

**Review date:** 18 October 2026  
**Purpose:** Give a follow-on coding assistant a concrete map of what exists, what is connected, and what should be completed next.

## How to read this audit

This is a static source-code review of the checked-out repository. “Implemented” means the source contains a working-looking path through the stated layers; it does not mean the app was run, the database migrations were applied, or the feature passed acceptance testing. No files other than this report were changed, and no tests or builds were run.

The working tree already contained user changes before this report was created. In particular, the cart client files, Prisma schema, cart migration, generated Prisma clients, app module, and new server cart files were modified or untracked. Treat that cart work as active work in progress and preserve it.

## Executive summary

The repository contains a customer storefront and a broad NestJS API backed by PostgreSQL/Prisma. The most complete customer-facing, cross-layer areas are authentication, catalogue browsing, customer profile/address management, wishlist, and basic cart/order creation. “Cross-layer” does not mean the whole business process is finished: the checkout UI collects payment and delivery choices but currently sends neither to the order API, and the payment/delivery APIs are not called from the checkout.

The backend also contains inventory, payments, delivery, suppliers, influencer/commission, rewards, CMS management, reports, and notifications. Several of these have models, controllers, use cases, and Prisma repositories, but there are no corresponding admin pages or frontend service modules in this Next app. They look like backend foundations for a future admin application or later phase.

### Status legend

- **Connected / substantially implemented:** frontend, API, and persistence code exist and are connected for the stated feature scope.
- **Partial / active:** important layers exist, but an end-to-end path is missing or current working-tree changes indicate implementation is ongoing.
- **Backend/data only:** server and data model are present, but this frontend has no matching user/admin workflow.
- **UI only / not established:** screen/form exists, but no corresponding persistent backend workflow was found.

## Module status at a glance

| Module                              | Frontend                                                                                              | Backend                                                                                                           | Database                                                                       | Status                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Auth                                | Login/register, auth state, token storage                                                             | Register/login/me, password hashing, JWT                                                                          | User/role/permission/customer models, migrations                               | Connected for customer login and registration; registration intentionally sends the user to login                                 |
| Catalogue                           | Public home/shop/category/product/promotions screens                                                  | Product/category/brand/variant/image CRUD and reads                                                               | Category, brand, product, variant, image                                       | Public browsing connected; management UI absent                                                                                   |
| Customer profile                    | Profile and address account pages                                                                     | Own-profile/address CRUD                                                                                          | Customer and customer-address                                                  | Connected                                                                                                                         |
| Wishlist                            | Guest local storage and account wishlist                                                              | Customer-authenticated get/add/remove/sync logic                                                                  | WishlistItem plus migration                                                    | Connected; sync should be validated for duplicates/retries                                                                        |
| Cart                                | Guest local storage, account cart service, cart/checkout screens                                      | Customer-authenticated get/add/update/remove/clear/sync                                                           | CartItem plus migration                                                        | Partial/active; current checkout contains uncommitted cart implementation                                                         |
| Orders                              | Checkout creates order; confirmation uses server response for persisted totals/items/delivery/payment | Guest/account create, customer reads, staff status transitions                                                    | Order and OrderItem; guest and delivery fields                                 | Checkout persistence connected for item prices, totals, delivery fields, and payment relation; guest retrieval remains incomplete |
| Payments                            | Checkout selection persisted and confirmation shows method/status                                     | Order creation atomically creates a PENDING payment; separate customer create/read and staff status update remain | Payment and PaymentMethod; Bank Card migration/seed                            | Connected for method and pending status; no gateway or automatic paid state                                                       |
| Delivery                            | Checkout captures delivery/pickup and tracking UI exists                                              | Staff create/update; role-authorized read                                                                         | Order fields store checkout choice/address; Delivery is operational fulfilment | Checkout intentionally does not create a Delivery row; customer read still lacks ownership enforcement                            |
| Inventory                           | No inventory screens                                                                                  | Stock CRUD, movements, low-stock, order/payment stock deduction                                                   | Inventory and InventoryMovement                                                | Backend/data only                                                                                                                 |
| CMS                                 | Home consumes CMS hook/service                                                                        | Banner/promotion CRUD and reads                                                                                   | Banner and Promotion                                                           | Partial: API requires JWT, but public home invokes it for anonymous visitors                                                      |
| Notifications                       | Account notifications page and hook                                                                   | List/read/read-all                                                                                                | Notification                                                                   | Basic connected; generation/dispatch not found                                                                                    |
| Suppliers/purchases                 | No UI/service                                                                                         | CRUD-like APIs and purchase workflows                                                                             | Supplier, Purchase, PurchaseItem                                               | Backend/data only                                                                                                                 |
| Influencers/commissions/withdrawals | No influencer portal/admin UI                                                                         | Registration, management, referrals, commissions, withdrawals                                                     | Influencer, Referral, Commission, WithdrawalRequest                            | Backend/data only; influencer self-service authorization needs review                                                             |
| Rewards                             | No customer/admin UI                                                                                  | Rules, award, get, redeem                                                                                         | CustomerRewardRule, CustomerReward                                             | Backend/data only                                                                                                                 |
| Reports                             | No reports dashboard                                                                                  | Dashboard/sales/inventory/commission/customer endpoints                                                           | Reads other domain tables                                                      | Backend/data only                                                                                                                 |
| Contact/newsletter                  | Contact and newsletter components                                                                     | No matching module found                                                                                          | No matching model found                                                        | UI only / submission persistence not established                                                                                  |

## Detailed findings by module

### 1. Authentication and customer registration — connected, with a deliberate two-step signup

**Frontend:** `/login` and `/register`; `client/src/modules/auth` contains forms, `useAuth`, `authService`, types, and browser token storage. Login stores the returned token, then attempts to synchronize guest wishlist and cart data. Registration redirects to the login screen after success rather than automatically logging the new user in.

**Backend:** `POST /v1/auth/register`, `POST /v1/auth/login`, and guarded `GET /v1/auth/me`. Registration checks for an existing email, hashes passwords with bcrypt, and creates a customer. Login verifies the hash and signs a JWT with user/role claims.

**Database:** `User`, `Role`, `Permission`, and `Customer`; the initial authentication migration and core schema migration are present. The Prisma user repository creates the customer/user records and resolves the configured Customer role.

**Status:** Customer registration/login/me are connected. Registration does not return a token, which matches the UI’s “go sign in” behavior. The client service’s generic registration response type appears broader than the server’s actual registration result; align the type to avoid misleading assumptions. Token storage uses local storage; consider the security tradeoffs when doing a later auth hardening pass.

### 2. Catalogue — public browse path connected; admin CRUD is server-side only

**Frontend:** `/`, `/shop`, `/shop/[id]`, `/categories`, `/promotions`; catalogue components cover product cards/details, category navigation, home content, shop filters, and promotions. `catalogueService` loads products, variants, and images; `categoryService` loads categories. Cart and wishlist actions are exposed on product cards/details.

**Backend:** Product, category, brand, product-variant, and product-image controllers and use cases. Read endpoints are public in the product controller; write operations are protected for staff/admin (delete is administrator-only in the product controller). Product image upload routes and static upload serving are configured.

**Database:** `Category`, `Brand`, `Product`, `ProductVariant`, and `ProductImage`, with schema relations and initial migration.

**Status:** Public product/category browsing is represented end to end. Backend write APIs exist, but this repository’s Next app has no product/category/brand admin screens or management service. Check all catalogue controller role guards individually before exposing any of the remaining write endpoints; product controller is protected, but this audit did not certify every sibling controller’s authorization.

### 3. Customer profile and addresses — connected

**Frontend:** Account overview, profile, and address pages under `/account`; customer module contains forms, cards, hooks, services, and types.

**Backend:** `GET/PATCH /v1/customers/profile` and `GET/POST/PATCH/DELETE /v1/customers/addresses`. Controller is guarded for Customer role and uses the authenticated user id rather than trusting a client-supplied customer id. Repository/use cases locate and update only the current customer’s records.

**Database:** `Customer` and `CustomerAddress`.

**Status:** The core account profile and address CRUD paths are connected. Checkout currently has separate transient address inputs; it does not appear to select/save a customer address through this module.

### 4. Cart — active implementation; guest and signed-in flows are present in code

**Frontend:** Cart page and checkout use `useCart` and `cartService`. Guest cart data lives in local storage. Signed-in cart calls `/v1/cart`, `/v1/cart/items`, and `/v1/cart/sync`; the login service attempts a guest-to-account sync. Product/variant information is mapped between API and storefront types.

**Backend:** Customer-role guarded controller supports get, add, update quantity/variant, remove, clear, and sync. Use cases delegate to a Prisma repository that checks product/variant existence, merges matching items, soft-deletes removed rows, and includes product/variant details when returning items.

**Database:** `CartItem` relates a customer, product, and optional variant. Migration `20261013005119_add_customer_cart` creates the table, indexes, and foreign keys.

**Status:** Significant implementation is present, but this is active/uncommitted work in the current tree. Review and finish the new cart code before treating it as done. Specifically check sync idempotency/merge behavior, removed/deleted item behavior, invalid quantities/variant selection, and consistency of the two generated Prisma client outputs. Then validate guest cart → login → account cart → checkout manually. Do not overwrite the existing working-tree changes.

### 5. Wishlist — connected for guest storage and signed-in persistence

**Frontend:** Wishlist page, add/toggle/remove hooks, guest local storage, login-time sync, and product controls. Account wishlist calls `/v1/wishlist` and merges API data into storefront product types.

**Backend:** Customer-role guarded list/add/remove endpoints. Repository checks product existence and stores customer-product wishlist items. Guest state itself is not stored server-side until sync after login.

**Database:** `WishlistItem`, customer/product relations, unique customer-product index, and migration `20261012085516_add_customer_wishlist`.

**Status:** The main paths are represented across all layers. Verify synchronization is repeat-safe and reconcile the unique index with soft-delete behavior: the schema permits one customer/product pair even if an old row has `deleted_at`, so re-adding must revive that row rather than insert a second one. The repository contains revival logic; confirm it works in all cases.

### 6. Checkout and orders — checkout persistence connected; post-order fulfillment remains separate

**Frontend:** `/checkout` validates contact details, terms, and selected product variants. It submits `POST /v1/orders` with source, variant IDs, quantities, selected payment method, delivery/pickup details, and guest name/email/phone when there is no token. It builds confirmation data from the server response for order status/date, persisted item unit prices and quantities, subtotal/discount, delivery fee/method/address, and payment method/status. It keeps customer contact display and product labels/images from the checkout session/cart, clears the cart, and navigates to `/order-confirmed`. Customer account pages call `/v1/orders` and `/v1/orders/:id`.

**Backend:** `POST /v1/orders` allows optional JWT and supports guest orders. It resolves a signed-in user to their customer profile, validates guest identity and delivery fields, then delegates creation. The Prisma order repository resolves item prices from current variant prices, calculates subtotal/discount/delivery/total, finds an active payment method, and creates the order plus its related payment in one transaction. Authenticated customers can list/read their own orders. Staff/admin can update order status through a controlled transition map. Inventory is deducted when an order moves from pending to confirmed.

**Database:** `Order` and `OrderItem`; guest order support migration adds guest identity fields. Schema includes source/status/amount/discount and item prices.

**Status:** Checkout persistence is connected for guest/account order creation, order items priced from the database, delivery details, payment method, and pending payment status. The two supplied test orders were verified read-only before this change: each has one item (variant `6d9ea85b-1c54-4347-b211-1ca7d55230a1`, quantity 1, unit price 45,000 FCFA), zero discount, a 2,000 FCFA delivery fee, and 47,000 FCFA total. They were not changed. Before the change neither had a Payment nor Delivery record; the migration only adds the Bank Card method and does not backfill historical orders. The account order endpoint remains customer-authenticated and cannot retrieve guest orders, and there is no guest tracking lookup found in this review. Order creation also does not clear a persistent account cart server-side. Signed-in checkout contact values and product display labels are not snapshotted in order rows; confirmation retains those display values in session storage.

### 7. Payments — checkout selection and pending record connected; gateway not implemented

**Frontend:** Checkout sends the selected MTN, Orange, Bank Card, or Cash Before Delivery method during order creation. Confirmation displays the method and payment status returned by the server. The UI states that payment remains pending until verified.

**Backend:** Checkout order creation resolves the selection to an active `PaymentMethod` and atomically creates its `Payment` record with the full order total, `PENDING` status, and no `paid_at` or transaction reference. The existing customer-authenticated payment creation validates order ownership and active payment method; customers can retrieve their payment by order; staff/admin can update payment status. When a payment becomes PAID for a pending order, the repository confirms the order and deducts stock inside a transaction.

**Database:** `Payment` and `PaymentMethod` models. Payment amount comes from the stored order total; status, transaction reference, and paid timestamp are represented. Migration `20261019000100_add_bank_card_payment_method` adds the existing UI's Bank Card option; the database seed also ensures that method exists.

**Status:** Method choice and pending payment persistence now span checkout, API, and database for guests and registered customers. No payment gateway or automated payment verification exists; all newly created checkout payments remain pending. Do not mark MTN, Orange, or Bank Card paid without external verification. The existing staff status endpoint is still capable of manual status changes and should be governed by an operational verification process. There is no payment-method lookup UI; checkout uses fixed method keys mapped to seeded method names.

### 8. Delivery and tracking — checkout details stored on Order; fulfillment record remains staff-managed

**Frontend:** Checkout collects delivery/pickup, address, city, and postal code. Account tracking pages exist. There is no delivery client service in the module inventory.

**Backend:** Staff/admin can create/update delivery records; the GET route allows Administrator, Staff, or Customer. The create repository checks the order and prevents a second active delivery. Updates can set address/provider/tracking number/status/delivered time.

**Database:** `Delivery` relates to an order and stores address, provider, status, tracking number, delivered timestamp.

**Status:** Checkout delivery method/address/city/postal code are persisted on `Order`. No `Delivery` row is created during checkout: the existing model stores provider/tracking/status and the only create endpoint is staff/admin-controlled, so it remains a later fulfillment step. More importantly, the Customer-authorized GET delivery endpoint takes only an order id and the use case/repository do not check that the authenticated customer owns that order. Add ownership filtering before exposing customer tracking and connect the tracking UI to a protected service after that check exists.

### 9. CMS banners/promotions — server CRUD exists; anonymous storefront loading is mismatched

**Frontend:** `useCms` loads active banners and promotions and the home page consumes the hook. The client CMS service requires an auth token for both reads.

**Backend:** Banner and promotion create/read/update/delete use cases and endpoints. The controller has class-level JWT and role guards; GET allows Customer, while writes allow staff/admin.

**Database:** `Banner` and `Promotion` models; promotions hold type/value/date range/active state.

**Status:** CMS management API and data exist, while admin UI is absent. The homepage is publicly accessible, but its CMS hook calls a token-required service and the GET endpoint has a class-level JWT guard. Anonymous visitors therefore cannot load CMS content through this path. Decide whether content reads should be public or the home page should only load them for authenticated users, then align both frontend and API. Also ensure active-only filtering and date validity are implemented as intended in the repository.

### 10. Notifications — basic customer read state is connected; creation/dispatch is missing from reviewed code

**Frontend:** `/account/notifications`, notifications hook/service, and list/item components call read, mark-one-read, and mark-all-read APIs.

**Backend:** Customer-role guarded list/read/read-all endpoints with a Prisma repository. Controller passes current user id; repository filters notifications by that user.

**Database:** `Notification` linked to `User`.

**Status:** Basic retrieval/read state spans the layers. I found no producer/dispatch path (for example, order lifecycle creating notifications, email/SMS, or realtime delivery). Build that separately if notifications are meant to appear automatically.

### 11. Inventory — backend/data operational module; no UI

**Frontend:** No inventory screens or client service found.

**Backend:** Staff/admin create/update/read inventory, list low stock, create movement, and list movements. Movement use case changes the quantity and stores a movement record. Orders and payment confirmation also deduct inventory and record stock-out movements.

**Database:** `Inventory` tied to product variants and `InventoryMovement` history.

**Status:** Backend/data implementation exists. Improve concurrency/atomicity: the generic movement use case reads quantity, computes a new value, updates inventory, and creates a movement in separate operations, so concurrent adjustments can race and a failed movement insert can leave quantity changed. Order/payment stock deductions use transactions and guarded decrement. Add an admin UI/report if inventory operations are in scope.

### 12. Suppliers and purchases — backend/data foundation only

**Frontend:** No supplier or purchase UI/service found.

**Backend:** Staff/admin endpoints create/list/get/update suppliers; create/list/get purchases and update purchase status. Use cases validate required supplier/purchase data. Purchase repository supports item records.

**Database:** `Supplier`, `Purchase`, and `PurchaseItem`.

**Status:** Backend/data only. Confirm purchase receipt actually increases inventory and creates corresponding stock-in movement; no end-to-end receiving workflow was established in this pass. Add UI if this is intended as a usable admin module.

### 13. Influencers, referrals, commissions, withdrawals — substantial backend, no frontend

**Frontend:** No influencer registration, influencer dashboard, or admin management screens/services found.

**Backend:** Public influencer registration endpoint; staff/admin influencer CRUD and approval; referrals; commission creation/read/status; withdrawal create/read/status. Use cases include status validation and commission/withdrawal state rules.

**Database:** `Influencer`, `Referral`, `Commission`, and `WithdrawalRequest`; referral/commission behavior is backed by order relations.

**Status:** Backend/data only. Important authorization follow-up: withdrawal routes allow the Influencer role but accept an arbitrary `influencerId` or record ID from the path. The shown controller does not compare those IDs with the authenticated influencer identity. Add ownership checks before influencer self-service access. Also validate that referral attribution actually happens during order creation; the checkout sends no referral code/discount in the reviewed request path.

### 14. Rewards — backend/data only

**Frontend:** No rewards UI/service found.

**Backend:** Staff/admin create/read/update rules and award rewards. Customers can read their own rewards and redeem them. Use cases resolve user id to customer id and verify ownership on redemption.

**Database:** `CustomerRewardRule` and `CustomerReward`.

**Status:** Backend/data only. Add customer/admin screens and integrate reward accrual with completed orders if automatic award behavior is expected. The current API includes explicit staff award; automatic points/eligibility processing was not established.

### 15. Reports — backend/data only

**Frontend:** No report/dashboard pages or API service found.

**Backend:** Staff/admin endpoints for dashboard summary, sales, inventory, commissions, and customer reports, with date filter DTO for the relevant reports and Prisma repository.

**Database:** Queries existing order, inventory, commission, and customer data; no separate report models are needed.

**Status:** API foundation only. Add a UI and verify report definitions, date-boundary behavior, and aggregation against expected business numbers.

### 16. Contact and newsletter — frontend presentation only in this repository

Contact page components and newsletter forms are present in the customer UI. The reviewed backend module list and Prisma model list do not show a contact-submission/newsletter subscription API or persistence model. Treat submissions as not implemented until a matching endpoint, storage, and delivery/consent behavior are added or confirmed in an external service.

## Cross-cutting implementation notes

1. **API versioning:** Nest enables URI versioning and controllers use version `1`; client default URL points to `http://localhost:3000/v1`. Configure deployment URLs and CORS deliberately before release.
2. **Validation:** A global Nest `ValidationPipe` uses whitelist, forbid-non-whitelisted, and transform. DTO decorators are therefore important; ensure every input DTO has validators and boundary constraints.
3. **Database migrations:** Prisma schema and migrations are source artifacts only. The repository state does not prove that migrations have been applied to the developer or production database. The seed file exists; review its role/payment-method/admin data before relying on the API.
4. **Generated clients:** The database package generates clients to both `database/generated/prisma` and `server/src/infrastructure/database/generated/prisma`. Cart changes currently touch generated outputs. Regenerate using the project’s intended Prisma command after schema edits and avoid hand-editing generated files.
5. **Automated verification:** There is a Nest smoke/e2e test scaffold, but this audit did not execute tests. Database package’s test script explicitly reports no tests configured. Most domain modules do not show dedicated test files in the listed tree.
6. **Admin client:** Backend role-protected APIs imply administrator/staff workflows, but this repo’s routed frontend is customer-focused. Search/confirm whether `src` or `maillotstore-UI-UX-design` is design-only or a separate in-progress app before starting a new admin frontend.

## Recommended continuation order

1. **Protect and finish current cart work.** Review the current uncommitted files; verify account cart behavior and sync semantics, and ensure cart is cleared server-side after successful order creation.
2. **Finish post-order workflows.** Define guest order retrieval/tracking, add delivery ownership filtering, and create staff fulfillment records for delivery orders when they are accepted. Do not create a Delivery row for pickup.
3. **Fix customer delivery ownership.** Restrict delivery lookup to the authenticated customer’s order and add explicit tests for cross-customer access.
4. **Make CMS public reads work for storefront visitors.** Align JWT policy and client token requirement, then verify anonymous homepage loading and active/date filtering.
5. **Add admin UI or explicitly scope backend-only APIs.** Inventory, catalogue management, CMS management, orders, suppliers/purchases, reports, rewards, and influencer administration currently lack matching screens here.
6. **Close domain workflow gaps.** Verify supplier receiving updates stock, influencer referral is attributed to orders, reward awards are tied to business events if required, and notifications are generated from events.
7. **Add focused validation and automated coverage.** Prioritize auth/role checks, guest/account cart sync, order creation and totals, payment/order/inventory state transitions, delivery ownership, and soft-delete re-add behavior for wishlist/cart.

## Suggested prompt for the next coding AI

> Read `FULL_STACK_MODULE_AUDIT.md` first. Preserve existing uncommitted work. Checkout now persists its payment method through a pending Payment record and stores delivery details on Order. Do not add or simulate payment success; no gateway is configured. Continue with guest order retrieval/tracking, delivery ownership checks, server-side cart clearing, and remaining admin workflows. Before coding, inspect current implementations and schema rather than replacing existing modules. Make public CMS banner/promotion reads work for anonymous storefront visitors. Work incrementally, update the audit as each feature is completed, and add focused tests for changed workflows and authorization boundaries. Do not claim a feature is complete unless its frontend, API, database persistence, and key success/error paths are connected.

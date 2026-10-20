ALTER TABLE "orders"
ADD COLUMN "guest_access_token_hash" TEXT;

CREATE UNIQUE INDEX "orders_guest_access_token_hash_key"
ON "orders"("guest_access_token_hash");

CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_messages_status_created_at_idx"
ON "contact_messages"("status", "created_at");

CREATE TABLE "newsletter_subscriptions" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "newsletter_subscriptions_email_key"
ON "newsletter_subscriptions"("email");

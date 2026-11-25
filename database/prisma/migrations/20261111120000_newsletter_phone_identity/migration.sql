-- A subscriber can be identified by either email or WhatsApp phone.
ALTER TABLE "newsletter_subscriptions" ALTER COLUMN "email" DROP NOT NULL;

-- Preserve existing subscriptions while making phone numbers unique for phone-only signups.
WITH duplicate_phones AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "phone" ORDER BY "updated_at" DESC, "created_at" DESC
  ) AS row_number
  FROM "newsletter_subscriptions"
  WHERE "phone" IS NOT NULL
)
UPDATE "newsletter_subscriptions" AS subscriptions
SET "phone" = NULL
FROM duplicate_phones
WHERE subscriptions."id" = duplicate_phones."id"
  AND duplicate_phones.row_number > 1;

CREATE UNIQUE INDEX "newsletter_subscriptions_phone_key"
  ON "newsletter_subscriptions"("phone");

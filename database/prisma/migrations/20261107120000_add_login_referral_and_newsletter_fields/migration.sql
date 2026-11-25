ALTER TABLE "users"
ADD COLUMN "last_login_at" TIMESTAMP(3);

ALTER TABLE "referrals"
ADD COLUMN "commission_rate_snapshot" DECIMAL(5,2);

UPDATE "referrals" AS r
SET "commission_rate_snapshot" = i."commission_rate"
FROM "influencers" AS i
WHERE r."influencer_id" = i."id"
  AND r."order_id" IS NOT NULL;

ALTER TABLE "newsletter_subscriptions"
ADD COLUMN "phone" TEXT,
ADD COLUMN "whatsapp_opt_in" BOOLEAN NOT NULL DEFAULT false;

UPDATE "referrals" AS r
SET "referral_code" = 'MS-' || UPPER(REPLACE(i."id"::text, '-', ''))
FROM "influencers" AS i
WHERE r."influencer_id" = i."id"
  AND i."referral_code" LIKE 'INF-%';

UPDATE "influencers"
SET "referral_code" = 'MS-' || UPPER(REPLACE("id"::text, '-', ''))
WHERE "referral_code" LIKE 'INF-%';

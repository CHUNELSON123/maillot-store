ALTER TABLE "influencers"
ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "date_of_birth" DATE,
ADD COLUMN "gender" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "occupation" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "application_note" TEXT,
ADD COLUMN "instagram_url" TEXT,
ADD COLUMN "tiktok_url" TEXT,
ADD COLUMN "youtube_url" TEXT,
ADD COLUMN "facebook_url" TEXT,
ADD COLUMN "x_url" TEXT,
ADD COLUMN "profile_picture_url" TEXT,
ADD COLUMN "terms_accepted_at" TIMESTAMP(3);

ALTER TABLE "referrals"
ADD COLUMN "attribution_token_hash" TEXT;

CREATE UNIQUE INDEX "referrals_attribution_token_hash_key"
ON "referrals"("attribution_token_hash");

ALTER TABLE "commissions"
ADD COLUMN "commission_rate_snapshot" DECIMAL(5,2);

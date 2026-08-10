-- AlterTable
ALTER TABLE "influencers" ADD COLUMN     "customer_discount_rate" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "influencer_discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "customer_reward_rules" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "purchase_count_threshold" INTEGER,
    "spending_threshold" DECIMAL(12,2),
    "reward_type" TEXT NOT NULL,
    "reward_value" DECIMAL(12,2),
    "gift_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "customer_reward_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_rewards" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "reward_rule_id" UUID NOT NULL,
    "reward_type" TEXT NOT NULL,
    "reward_value" DECIMAL(12,2),
    "gift_description" TEXT,
    "status" TEXT NOT NULL,
    "awarded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,
    "deleted_by" UUID,

    CONSTRAINT "customer_rewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "customer_rewards_customer_id_idx" ON "customer_rewards"("customer_id");

-- CreateIndex
CREATE INDEX "customer_rewards_reward_rule_id_idx" ON "customer_rewards"("reward_rule_id");

-- CreateIndex
CREATE INDEX "customer_rewards_status_idx" ON "customer_rewards"("status");

-- AddForeignKey
ALTER TABLE "customer_rewards" ADD CONSTRAINT "customer_rewards_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_rewards" ADD CONSTRAINT "customer_rewards_reward_rule_id_fkey" FOREIGN KEY ("reward_rule_id") REFERENCES "customer_reward_rules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

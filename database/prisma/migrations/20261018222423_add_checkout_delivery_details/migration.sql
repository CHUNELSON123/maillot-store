-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery_address" TEXT,
ADD COLUMN     "delivery_city" TEXT,
ADD COLUMN     "delivery_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "delivery_method" TEXT NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "delivery_postal_code" TEXT;

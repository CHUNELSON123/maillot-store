/*
  Warnings:

  - You are about to drop the column `created_by` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_by` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updated_by` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_customer_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "created_by",
DROP COLUMN "deleted_by",
DROP COLUMN "updated_by",
ADD COLUMN     "guest_email" TEXT,
ADD COLUMN     "guest_name" TEXT,
ADD COLUMN     "guest_phone" TEXT,
ALTER COLUMN "customer_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `courier_code` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_type` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `service_code` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shipping_fee` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `snap_redirect_url` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `snap_token` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `tracking_code` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_id` on the `Order` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED');

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "courier_code",
DROP COLUMN "payment_type",
DROP COLUMN "service_code",
DROP COLUMN "shipping_fee",
DROP COLUMN "snap_redirect_url",
DROP COLUMN "snap_token",
DROP COLUMN "tracking_code",
DROP COLUMN "transaction_id";

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "transaction_id" TEXT,
    "snap_token" TEXT,
    "snap_redirect_url" TEXT,
    "payment_type" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "raw_response" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transaction_id_key" ON "public"."Payment"("transaction_id");

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "public"."Payment"("order_id");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

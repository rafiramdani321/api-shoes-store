-- CreateEnum
CREATE TYPE "public"."StatusOrder" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PAYMENT_FAILED', 'BEING_PACKED', 'SHIPPED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Order" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_address_id" TEXT NOT NULL,
    "status" "public"."StatusOrder" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "total_price" INTEGER NOT NULL,
    "shipping_fee" INTEGER,
    "courier_code" TEXT,
    "service_code" TEXT,
    "tracking_code" TEXT,
    "transaction_id" TEXT,
    "snap_token" TEXT,
    "snap_redirect_url" TEXT,
    "payment_type" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "size_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_user_id_idx" ON "public"."Order"("user_id");

-- CreateIndex
CREATE INDEX "Order_user_id_status_idx" ON "public"."Order"("user_id", "status");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "public"."Order"("status");

-- CreateIndex
CREATE INDEX "OrderItem_order_id_idx" ON "public"."OrderItem"("order_id");

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order" ADD CONSTRAINT "Order_user_address_id_fkey" FOREIGN KEY ("user_address_id") REFERENCES "public"."UserAddresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."Size"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

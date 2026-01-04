/*
  Warnings:

  - You are about to drop the column `size_id` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `product_size_id` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."OrderItem" DROP CONSTRAINT "OrderItem_size_id_fkey";

-- AlterTable
ALTER TABLE "public"."OrderItem" DROP COLUMN "size_id",
ADD COLUMN     "product_size_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_product_size_id_fkey" FOREIGN KEY ("product_size_id") REFERENCES "public"."ProductSize"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

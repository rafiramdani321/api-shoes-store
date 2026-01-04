/*
  Warnings:

  - Added the required column `product_image_url` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_size` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_title` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "product_image_url" TEXT NOT NULL,
ADD COLUMN     "product_size" TEXT NOT NULL,
ADD COLUMN     "product_title" TEXT NOT NULL;

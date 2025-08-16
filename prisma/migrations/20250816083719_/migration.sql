/*
  Warnings:

  - Added the required column `updated_by` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `Size` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `Size` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_by` to the `SubCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Category" ADD COLUMN     "updated_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "updated_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Size" ADD COLUMN     "created_by" TEXT NOT NULL,
ADD COLUMN     "updated_by" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubCategory" ADD COLUMN     "updated_by" TEXT NOT NULL;

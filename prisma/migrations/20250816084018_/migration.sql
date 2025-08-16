-- AlterTable
ALTER TABLE "public"."Category" ALTER COLUMN "updated_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "updated_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Size" ALTER COLUMN "updated_by" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SubCategory" ALTER COLUMN "updated_by" DROP NOT NULL;

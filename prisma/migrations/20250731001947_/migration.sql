-- DropForeignKey
ALTER TABLE "public"."TokenVerification" DROP CONSTRAINT "TokenVerification_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."TokenVerification" ALTER COLUMN "expires_at" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."TokenVerification" ADD CONSTRAINT "TokenVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

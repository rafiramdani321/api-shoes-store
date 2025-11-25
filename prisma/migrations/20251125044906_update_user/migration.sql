-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "date_of_birth" TIMESTAMP(3),
ADD COLUMN     "fullname" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone_number" TEXT;

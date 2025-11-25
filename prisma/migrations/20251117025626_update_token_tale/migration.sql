/*
  Warnings:

  - You are about to drop the `TokenVerification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('EMAIL_ACTIVATION', 'PASSWORD_RESET');

-- DropForeignKey
ALTER TABLE "public"."TokenVerification" DROP CONSTRAINT "TokenVerification_user_id_fkey";

-- DropTable
DROP TABLE "public"."TokenVerification";

-- CreateTable
CREATE TABLE "public"."Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "public"."statusToken" NOT NULL DEFAULT 'ACTIVE',
    "type" "public"."TokenType" NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "public"."Token"("token");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "public"."Token"("token");

-- CreateIndex
CREATE INDEX "Session_user_id_idx" ON "public"."Session"("user_id");

-- AddForeignKey
ALTER TABLE "public"."Token" ADD CONSTRAINT "Token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

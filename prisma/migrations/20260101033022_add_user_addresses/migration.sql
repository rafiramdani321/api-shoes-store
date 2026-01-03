-- CreateTable
CREATE TABLE "public"."UserAddresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipent_name" TEXT NOT NULL,
    "label_address" TEXT NOT NULL,
    "phone_number_recipent" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "province_id" TEXT,
    "province_name" TEXT NOT NULL,
    "city_id" TEXT,
    "city_name" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAddresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserAddresses_user_id_idx" ON "public"."UserAddresses"("user_id");

-- AddForeignKey
ALTER TABLE "public"."UserAddresses" ADD CONSTRAINT "UserAddresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

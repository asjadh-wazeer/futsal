-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('PENDING', 'PAID');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "courtAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "platformFee" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "grossRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "platformFees" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "ownerAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "SettlementStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settlements_businessId_month_key" ON "settlements"("businessId", "month");

-- AddForeignKey
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "BookingSource" AS ENUM ('CUSTOMER', 'MANUAL');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "source" "BookingSource" NOT NULL DEFAULT 'CUSTOMER';

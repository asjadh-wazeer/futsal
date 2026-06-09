-- Court → Sport becomes many-to-many; Booking records which sport was played

-- Step 1: Drop old FK on courts.sportId
ALTER TABLE "courts" DROP CONSTRAINT "courts_sportId_fkey";

-- Step 2: Add sportId to bookings
ALTER TABLE "bookings" ADD COLUMN "sportId" TEXT;

-- Step 3: Create M2M join table
CREATE TABLE "_CourtToSport" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Step 4: Indexes
CREATE UNIQUE INDEX "_CourtToSport_AB_unique" ON "_CourtToSport"("A", "B");
CREATE INDEX "_CourtToSport_B_index" ON "_CourtToSport"("B");

-- Step 5: FK constraints on join table
ALTER TABLE "_CourtToSport" ADD CONSTRAINT "_CourtToSport_A_fkey" FOREIGN KEY ("A") REFERENCES "courts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_CourtToSport" ADD CONSTRAINT "_CourtToSport_B_fkey" FOREIGN KEY ("B") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Migrate existing sport assignments
INSERT INTO "_CourtToSport" ("A", "B")
SELECT id, "sportId" FROM courts WHERE "sportId" IS NOT NULL;

-- Step 7: Drop old column
ALTER TABLE "courts" DROP COLUMN "sportId";

-- Step 8: FK for bookings.sportId
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "sports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the column `rating` on the `DriverProfile` table. All the data in the column will be lost.
  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "DriverProfile" DROP COLUMN "rating";

-- DropTable
DROP TABLE "SystemConfig";

-- DropEnum
DROP TYPE "DiscountType";

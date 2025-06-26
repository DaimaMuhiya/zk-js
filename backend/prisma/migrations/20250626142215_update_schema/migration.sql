/*
  Warnings:

  - You are about to drop the column `cardNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `deviceSn` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cardno` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `role` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "deviceSn" TEXT NOT NULL,
ADD COLUMN     "rawData" JSONB;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cardNumber",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "cardno" TEXT NOT NULL,
ALTER COLUMN "deviceUserId" SET DATA TYPE TEXT,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "role" SET DATA TYPE TEXT;

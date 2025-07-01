/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_userId_fkey";

-- DropTable
DROP TABLE "Attendance";

-- CreateTable
CREATE TABLE "attendances" (
    "user_id" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,
    "device_sn" TEXT NOT NULL,
    "raw_data" JSONB NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("user_id","timestamp")
);

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

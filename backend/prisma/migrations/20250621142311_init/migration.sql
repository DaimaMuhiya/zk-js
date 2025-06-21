-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "deviceUserId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "cardNumber" TEXT,
    "role" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_deviceUserId_key" ON "User"("deviceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_userId_timestamp_key" ON "Attendance"("userId", "timestamp");

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

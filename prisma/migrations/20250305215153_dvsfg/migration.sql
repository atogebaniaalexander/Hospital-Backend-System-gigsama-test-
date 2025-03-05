/*
  Warnings:

  - The primary key for the `ActionableStep` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `ActionableStep` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Admin` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Admin` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Doctor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Doctor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Note` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Note` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Patient` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `doctorId` column on the `Patient` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Reminder` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Reminder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `adminId` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `doctorId` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `patientId` column on the `Token` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `noteId` on the `ActionableStep` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `patientId` on the `Note` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `doctorId` on the `Note` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `patientId` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `doctorId` on the `Reminder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ActionableStep" DROP CONSTRAINT "ActionableStep_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_adminId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "Token" DROP CONSTRAINT "Token_patientId_fkey";

-- AlterTable
ALTER TABLE "ActionableStep" DROP CONSTRAINT "ActionableStep_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "noteId",
ADD COLUMN     "noteId" INTEGER NOT NULL,
ADD CONSTRAINT "ActionableStep_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Doctor" DROP CONSTRAINT "Doctor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Note" DROP CONSTRAINT "Note_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" INTEGER NOT NULL,
DROP COLUMN "doctorId",
ADD COLUMN     "doctorId" INTEGER NOT NULL,
ADD CONSTRAINT "Note_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Patient" DROP CONSTRAINT "Patient_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "doctorId",
ADD COLUMN     "doctorId" INTEGER,
ADD CONSTRAINT "Patient_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Reminder" DROP CONSTRAINT "Reminder_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" INTEGER NOT NULL,
DROP COLUMN "doctorId",
ADD COLUMN     "doctorId" INTEGER NOT NULL,
ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Token" DROP COLUMN "adminId",
ADD COLUMN     "adminId" INTEGER,
DROP COLUMN "doctorId",
ADD COLUMN     "doctorId" INTEGER,
DROP COLUMN "patientId",
ADD COLUMN     "patientId" INTEGER;

-- CreateIndex
CREATE INDEX "ActionableStep_noteId_idx" ON "ActionableStep"("noteId");

-- CreateIndex
CREATE INDEX "Note_patientId_idx" ON "Note"("patientId");

-- CreateIndex
CREATE INDEX "Note_doctorId_idx" ON "Note"("doctorId");

-- CreateIndex
CREATE INDEX "Patient_doctorId_idx" ON "Patient"("doctorId");

-- CreateIndex
CREATE INDEX "Reminder_patientId_idx" ON "Reminder"("patientId");

-- CreateIndex
CREATE INDEX "Reminder_doctorId_idx" ON "Reminder"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_adminId_key" ON "Token"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_doctorId_key" ON "Token"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_patientId_key" ON "Token"("patientId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionableStep" ADD CONSTRAINT "ActionableStep_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

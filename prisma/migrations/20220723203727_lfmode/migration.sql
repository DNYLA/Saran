/*
  Warnings:

  - You are about to drop the column `lastFMEmbed` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastFMEmbed",
ADD COLUMN     "lastFMMode" TEXT;

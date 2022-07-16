/*
  Warnings:

  - The primary key for the `Levels` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Levels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Levels" DROP CONSTRAINT "Levels_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Levels_pkey" PRIMARY KEY ("roleId", "serverId");

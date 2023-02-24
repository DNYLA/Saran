/*
  Warnings:

  - You are about to drop the column `filters` on the `GuildUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GuildConfig" ADD COLUMN     "filters" TEXT[];

-- AlterTable
ALTER TABLE "GuildUser" DROP COLUMN "filters";

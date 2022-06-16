/*
  Warnings:

  - You are about to drop the `Server` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Server";

-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT E',',

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("id")
);

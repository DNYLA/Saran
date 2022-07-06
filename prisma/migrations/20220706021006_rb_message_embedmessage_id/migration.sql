/*
  Warnings:

  - Added the required column `embedMessageId` to the `ReactionBoardMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReactionBoardMessages" ADD COLUMN     "embedMessageId" TEXT NOT NULL;

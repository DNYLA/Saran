/*
  Warnings:

  - The primary key for the `ReactionBoardMessages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ReactionBoardMessages` table. All the data in the column will be lost.
  - Added the required column `messageId` to the `ReactionBoardMessages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ReactionBoardMessages" DROP CONSTRAINT "ReactionBoardMessages_pkey",
DROP COLUMN "id",
ADD COLUMN     "messageId" TEXT NOT NULL,
ADD CONSTRAINT "ReactionBoardMessages_pkey" PRIMARY KEY ("messageId", "serverId");

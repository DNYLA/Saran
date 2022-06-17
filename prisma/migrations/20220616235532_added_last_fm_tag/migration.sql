-- AlterTable
ALTER TABLE "GuildConfig" ALTER COLUMN "reactionBoardLimit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastFMTag" TEXT;

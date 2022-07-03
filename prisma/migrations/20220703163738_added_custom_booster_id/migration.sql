-- AlterTable
ALTER TABLE "GuildUser" ADD COLUMN     "customBoostRoleId" TEXT,
ADD COLUMN     "isBooster" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "displayName" DROP NOT NULL;

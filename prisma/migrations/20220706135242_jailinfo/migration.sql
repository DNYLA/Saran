-- AlterTable
ALTER TABLE "GuildConfig" ADD COLUMN     "jailChannel" TEXT,
ADD COLUMN     "jailLogChannel" TEXT,
ADD COLUMN     "jailRole" TEXT;

-- AlterTable
ALTER TABLE "GuildUser" ADD COLUMN     "preJailedRoles" TEXT[];

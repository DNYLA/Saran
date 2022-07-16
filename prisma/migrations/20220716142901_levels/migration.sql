-- CreateTable
CREATE TABLE "Levels" (
    "id" SERIAL NOT NULL,
    "serverId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "xp" INTEGER NOT NULL,

    CONSTRAINT "Levels_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Levels" ADD CONSTRAINT "Levels_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "GuildConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

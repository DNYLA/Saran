-- CreateTable
CREATE TABLE "GuildUser" (
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "lastFMTag" TEXT,
    "reactionBoardScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GuildUser_pkey" PRIMARY KEY ("userId","serverId")
);

-- CreateTable
CREATE TABLE "ReactionBoardMessages" (
    "id" TEXT NOT NULL,
    "serverId" TEXT NOT NULL,
    "reactionName" TEXT NOT NULL,
    "reactions" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ReactionBoardMessages_pkey" PRIMARY KEY ("id","serverId")
);

-- AddForeignKey
ALTER TABLE "GuildUser" ADD CONSTRAINT "GuildUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReactionBoardMessages" ADD CONSTRAINT "ReactionBoardMessages_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "GuildConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

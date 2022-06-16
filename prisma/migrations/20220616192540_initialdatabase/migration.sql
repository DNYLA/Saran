-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "lastFMName" TEXT,
    "discriminator" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL DEFAULT E',',

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);

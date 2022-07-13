-- CreateTable
CREATE TABLE "UserTracks" (
    "trackId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "plays" INTEGER NOT NULL,

    CONSTRAINT "UserTracks_pkey" PRIMARY KEY ("trackId")
);

-- CreateTable
CREATE TABLE "UserAlbums" (
    "albumId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "plays" INTEGER NOT NULL,

    CONSTRAINT "UserAlbums_pkey" PRIMARY KEY ("albumId")
);

-- CreateTable
CREATE TABLE "UserArtists" (
    "artistId" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "plays" INTEGER NOT NULL,

    CONSTRAINT "UserArtists_pkey" PRIMARY KEY ("artistId")
);

-- AddForeignKey
ALTER TABLE "UserTracks" ADD CONSTRAINT "UserTracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlbums" ADD CONSTRAINT "UserAlbums_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArtists" ADD CONSTRAINT "UserArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

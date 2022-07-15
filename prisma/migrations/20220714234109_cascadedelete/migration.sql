-- DropForeignKey
ALTER TABLE "GuildUser" DROP CONSTRAINT "GuildUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAlbums" DROP CONSTRAINT "UserAlbums_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserArtists" DROP CONSTRAINT "UserArtists_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTracks" DROP CONSTRAINT "UserTracks_userId_fkey";

-- AddForeignKey
ALTER TABLE "GuildUser" ADD CONSTRAINT "GuildUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTracks" ADD CONSTRAINT "UserTracks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlbums" ADD CONSTRAINT "UserAlbums_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserArtists" ADD CONSTRAINT "UserArtists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

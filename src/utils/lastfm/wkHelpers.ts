import { Message } from 'discord.js';
import DiscordClient from '../client';
import { getCachedPlays, setCachedPlays } from '../database/redisManager';
import { getGuildUsers, SaranUser } from '../database/User';
import {
  fetchRecentAlbumInfo,
  fetchRecentArtistInfo,
  fetchRecentTrackInfo,
  SearchType,
} from '../fmHelpers';
import { Album, Artist, Track } from '../types';

//Custom type as theres no need to differentiate between GuildUser | User as
//we access data from both users
//Would be smarter to return  getGuildUsers() without the guilds fetched
//(This has essentially been coded in the new database classes/system which is currently)
//In development
type WhoKnowsUser = {
  lastFMName: string;
  id: string;
};

export async function GetWhoKnowsInfo(
  message: Message,
  userId: string,
  fetchRecent: boolean,
  recentType: SearchType,
  globalSearch?: boolean
) {
  const user = await new SaranUser(userId).fetch();
  let users: WhoKnowsUser[];
  const client = message.client as DiscordClient;
  if (!globalSearch) {
    users = await getGuildUsers(message.guildId);
  } else {
    users = await client.database.users.repo.findMany({
      where: { lastFMName: { not: null } },
    });
  }

  const guildUsers = await getGuildUsers(message.guildId);
  let recent: Track | Album | Artist;

  if (!guildUsers || guildUsers.length === 0) {
    message.reply('Server hasnt been indexed use ,lf index');
    return { indexed: false, recent: null, user, users };
  }

  if (fetchRecent) {
    if (recentType === SearchType.Track) {
      const { track: recentTrack } = await fetchRecentTrackInfo(
        user.self.lastFMName
      );
      recent = recentTrack;
    } else if (recentType === SearchType.Album) {
      const { album: recentAlbum } = await fetchRecentAlbumInfo(
        user.self.lastFMName
      );
      recent = recentAlbum;
    } else if (recentType === SearchType.Artist) {
      const { artist: recentArtist } = await fetchRecentArtistInfo(
        user.self.lastFMName
      );
      recent = recentArtist;
    }
  }

  return { indexed: true, recent, user, users };
}

// type fetchPlaysType = () => Promise<number>;

export async function GetWhoKnowsListeners(
  users: WhoKnowsUser[],
  cacheKey: string,
  type: SearchType,
  fetchPlays: (username: string) => Promise<number>
) {
  const wkInfo = [];
  for (let i = 0; i < users.length; i++) {
    const member = users[i];
    if (!member.lastFMName) continue; //This shouldnt occur but checked anyways

    try {
      const item = {
        id: member.id,
        fmName: member.lastFMName,
      };

      const cachedPlays = await getCachedPlays(
        member.lastFMName,
        cacheKey,
        type
      );
      if (cachedPlays) {
        wkInfo.push({ ...item, plays: cachedPlays });
        continue; //Data already cached so we can use that and continue to next user
      }

      const plays = await fetchPlays(member.lastFMName);
      if (plays === 0) continue;
      wkInfo.push({ ...item, plays: plays });

      await setCachedPlays(
        member.lastFMName,
        cacheKey,
        plays,
        SearchType.Track
      );
    } catch (err) {
      console.log(err);
    }
  }

  return wkInfo;
}

export async function FormatWhoKnowsArray(
  message: Message,
  wkInfo: {
    id: string;
    fmName: string;
    plays: number;
  }[]
) {
  let sum = 0;
  let description = '';
  const totalListeners = wkInfo.filter((a) => a.plays > 0).length; //Returns total amount of listeners above 0 plays
  wkInfo.sort((a, b) => b.plays - a.plays).slice(0, 10); //Sort array and take top 10

  //Sometimes slicing top 10 doesnt work so to double check we only loop over 10
  for (let i = 0; i < 10; i++) {
    if (i > wkInfo.length - 1) break;
    const { id, fmName, plays } = wkInfo[i];
    if (plays <= 0) break; //Array sorted so if one value is 0 the rest will be 0
    try {
      const discordUser = await message.client.users.fetch(id);
      if (!discordUser) return; //Unable to fetch the user
      const formatted = `${discordUser.username}#${discordUser.discriminator}`;
      sum += Number(plays);
      description += `**${i + 1}. [${
        i === 0 ? '👑' : ''
      } ${formatted}](https://www.last.fm/user/${fmName})** has **${plays}** plays\n`;
    } catch (err) {
      console.log(err);
    }
  }

  return { sum, description, totalListeners };
}

// export function createWkEmbed(
//   username: string,
//   title: string,
//   description: string,
//   totalListeners: number,
//   sum: number
// ) {
//   return new MessageEmbed()
//     .setColor('#2F3136')
//     .setAuthor({
//       name: `Requested by ${username}`,
//       url: `https://www.last.fm/user/${username}`,
//       iconURL:
//         'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
//     })
//     .setTitle(title)
//     .setDescription(description)
//     .setFooter({
//       text: `Total Listeners: ${totalListeners} ∙ Total Plays: ${sum}`,
//     });
// }

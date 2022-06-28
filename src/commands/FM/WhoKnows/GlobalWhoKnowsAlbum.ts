import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import {
  getCachedPlays,
  setCachedPlays,
} from '../../../utils/database/redisManager';
import {
  getGuildUsers,
  getUser,
  getUsersWithUsername,
} from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  fetchRecentArtistInfo,
  fetchSearchAlbumInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { Album, Artist } from '../../../utils/types';

export default class GlobalWhoKnowsAlbum extends Command {
  constructor() {
    super('lf gwka', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      args: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'albumName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: string[],
    argums: { targetUserId: string; albumName: string }
  ) {
    const user = await getUser(argums.targetUserId);
    const guildUsers = await getUsersWithUsername();

    let album: Album;

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    if (!argums.albumName) {
      const { album: recentAlbum } = await fetchRecentAlbumInfo(
        user.lastFMName
      );

      album = recentAlbum;
    } else {
      album = await fetchSearchAlbumInfo(user.lastFMName, argums.albumName);
    }

    if (!album) return message.reply('Unable to find album with name!');

    let sum = 0;
    let description = '';
    const wkInfo = [];
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const cachedPlays = await getCachedPlays(
          member.lastFMName,
          `${album.name}-${album.artist}`,
          SearchType.Album
        );

        const item = {
          id: member.id,
          fmName: member.lastFMName,
        };
        if (cachedPlays) {
          wkInfo.push({ ...item, plays: cachedPlays });
          continue;
        }

        const albumInfo = await fetchAlbumInfo(
          member.lastFMName,
          album.name,
          album.artist
        );

        if (!albumInfo) continue;
        if (albumInfo.userplaycount === 0) continue;

        wkInfo.push({
          ...item,
          plays: albumInfo.userplaycount,
        });

        await setCachedPlays(
          member.lastFMName,
          `${album.name}-${album.artist}`,
          albumInfo.userplaycount,
          SearchType.Album
        );
      } catch (err) {
        console.log(err);
      }
    }

    const sortedArray = wkInfo.sort((a, b) => b.plays - a.plays).slice(0, 10);

    for (let i = 0; i < sortedArray.length; i++) {
      const { id, fmName, plays } = sortedArray[i];
      console.log(id);
      try {
        const discordUser = await message.client.users.fetch(id);
        if (!discordUser) return;
        const formatted = `${discordUser.username}#${discordUser.discriminator}`;
        sum += Number(plays);
        description += `**${i + 1}. [${
          i === 0 ? '👑' : ''
        } ${formatted}](https://www.last.fm/user/${fmName})** has **${plays}** plays\n`;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${album.name} by ${album.artist}`)
        .setDescription(description)
        .setFooter({
          text: `Total Listeners: ${wkInfo.length} ∙ Total Plays: ${sum}`,
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }

    //This is glitched
    // guildUsers.forEach(async (member) => {
    //   if (!member.lastFMTag) return; //This shouldnt occur but checked anyways
    //   try {
    //     const trackInfo = await fetchTrackInfoWrapper(
    //       member.lastFMName,
    //       track.name,
    //       track.artist.name
    //     );
    //     console.log(member);
    //     if (!trackInfo) return;
    //     if (trackInfo.userplaycount === 0) return;

    //     wkInfo.push({ member, plays: trackInfo.userplaycount });
    //   } catch (err) {
    //     console.log(err);
    //   }
    // });
  }
}

import { Message, MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../../api/lastfm';
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
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { Artist, PartialUser } from '../../../utils/types';

export default class GlobalWhoKnows extends Command {
  constructor() {
    super('lf gwk', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: ',lf wk <artistName>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'artistName',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; artistName: string }
  ) {
    const user = await getUser(args.targetUserId);
    const guildUsers = await getUsersWithUsername();

    let artist: Artist;
    let userInfo: PartialUser;

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    if (!args.artistName) {
      const { artist: recentArtist } = await fetchRecentArtistInfo(
        user.lastFMName
      );
      artist = recentArtist;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }

    if (!artist) return message.reply('Unable to find artist with name!');

    let sum = 0;
    let description = '';
    const wkInfo = [];
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const cachedPlays = await getCachedPlays(
          member.lastFMName,
          artist.name,
          SearchType.Artist
        );

        const item = {
          id: member.id,
          fmName: member.lastFMName,
        };

        if (cachedPlays) {
          wkInfo.push({ ...item, plays: cachedPlays });
          continue;
        }

        const artistInfo = await fetchArtistInfo(
          member.lastFMName,
          artist.name
        );
        if (!artistInfo) continue;
        const fetchedPlays = artistInfo.stats.userplaycount;
        if (fetchedPlays === 0) continue;

        wkInfo.push({ ...item, plays: fetchedPlays });
        await setCachedPlays(
          member.lastFMName,
          artist.name,
          fetchedPlays,
          SearchType.Artist
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
    // .map(({ id, fmName, plays }, i) => {});

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${artist.name}`)
        .setDescription(description)
        .setFooter({
          text: `Total Listeners: ${wkInfo.length} ∙ Total Plays: ${sum}`,
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

import { Message, MessageEmbed } from 'discord.js';
import { fetchTrackInfo } from '../../../api/lastfm';
import UsernameCheck, {
  UsernameCheckNoMentions,
} from '../../../checks/UsernameCheck';
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
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { Track } from '../../../utils/types';
import { SearchTrackArguments } from '../Plays/playsTrack';

export default class GlobalWhoKnowstrack extends Command {
  constructor() {
    super('lf gwkt', {
      requirments: {
        custom: UsernameCheckNoMentions,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'trackName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
        {
          name: 'artistName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
      ],
    });
  }

  async run(message: Message, args: SearchTrackArguments) {
    const user = await getUser(args.targetUserId);

    const guildUsers = await getUsersWithUsername();
    let track: Track;

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    if (!args.trackName) {
      const { track: recentTrack } = await fetchRecentTrackInfo(
        user.lastFMName
      );

      track = recentTrack;
    } else {
      track = await fetchSearchTrackInfo(
        user.lastFMName,
        args.trackName,
        args.artistName
      );
    }

    if (!track)
      return message.reply(
        'Unable to find recent track or track isnt valid to who knows!'
      );

    let sum = 0;
    let description = '';
    const wkInfo = [];

    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const cachedPlays = await getCachedPlays(
          member.lastFMName,
          `${track.name}-${track.artist.name}`,
          SearchType.Track
        );
        const item = {
          id: member.id,
          fmName: member.lastFMName,
        };
        if (cachedPlays) {
          wkInfo.push({ ...item, plays: cachedPlays });
          continue;
        }

        const trackInfo = await fetchTrackInfo(
          member.lastFMName,
          track.name,
          track.artist.name
        );

        if (!trackInfo) continue;
        if (Number(trackInfo.userplaycount) === 0) continue;

        wkInfo.push({ ...item, plays: trackInfo.userplaycount });

        await setCachedPlays(
          member.lastFMName,
          `${track.name}-${track.artist.name}`,
          trackInfo.userplaycount,
          SearchType.Track
        );
      } catch (err) {
        console.log(err);
      }
    }

    const sortedArray = wkInfo.sort((a, b) => b.plays - a.plays).slice(0, 10);

    for (let i = 0; i < 10; i++) {
      if (i > wkInfo.length - 1) break;
      const { id, fmName, plays } = sortedArray[i];
      if (plays <= 0) continue;

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
        .setTitle(`Top Listeners for ${track.name} by ${track.artist.name}`)
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

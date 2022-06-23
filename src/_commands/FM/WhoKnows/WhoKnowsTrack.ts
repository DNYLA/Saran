import { Message, MessageEmbed } from 'discord.js';
import { fetchTrackInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import Command2 from '../../../utils/base/Command2';
import DiscordClient from '../../../utils/client';
import { getGuildUsers, getUser } from '../../../utils/database/User';
import {
  fetchRecentTrackInfo,
  getTargetUserId,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';

export default class NowPlaying extends Command2 {
  constructor() {
    super('lf wkt', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getUser(getTargetUserId(message, args, true));

    const guildUsers = await getGuildUsers(message.guildId);

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    const { track, recentTrack } = await fetchRecentTrackInfo(user.lastFMName);

    if (!track || !recentTrack)
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
        const trackInfo = await fetchTrackInfo(
          member.lastFMName,
          track.name,
          track.artist.name
        );

        if (!trackInfo) continue;
        if (Number(trackInfo.userplaycount) === 0) continue;

        wkInfo.push({
          displayName: member.guilds[0].displayName,
          fmName: member.lastFMName,
          plays: trackInfo.userplaycount,
        });
      } catch (err) {
        console.log(err);
      }
    }

    wkInfo
      .sort((a, b) => b.plays - a.plays)
      .slice(0, 10)
      .map(({ displayName, fmName, plays }, i) => {
        try {
          sum += Number(plays);
          return (description += `**${i + 1}. [${
            i === 0 ? '👑' : ''
          } ${displayName}](https://www.last.fm/user/${fmName})** has **${plays}** plays\n`);
        } catch (err) {
          console.log(err);
        }
      });

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

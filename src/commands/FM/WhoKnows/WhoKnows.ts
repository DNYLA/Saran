import { Message, MessageEmbed } from 'discord.js';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { getGuildUsers } from '../../../utils/database/User';
import {
  fetchRecentTrackInfo,
  fetchTrackInfoWrapper,
  getTopTenStats,
  getUserFromMessage,
  hasUsernameSet,
  SearchType,
} from '../../../utils/fmHelpers';

export default class NowPlaying extends Command {
  constructor() {
    super('lf wkt', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const guildUsers = await getGuildUsers(message.guildId);

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    const {
      track,
      recentTrack,
      user: userInfo,
    } = await fetchRecentTrackInfo(user.lastFMName);

    if (!track || !recentTrack)
      return message.reply(
        'Unable to find recent track or track isnt valid to who knows!'
      );

    let sum = 0;
    let description = '';
    const wkInfo = [];
    console.log(guildUsers);
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) return; //This shouldnt occur but checked anyways
      try {
        const trackInfo = await fetchTrackInfoWrapper(
          member.lastFMName,
          track.name,
          track.artist.name
        );
        console.log(member);
        if (!trackInfo) return;
        if (trackInfo.userplaycount === 0) return;

        wkInfo.push({
          displayName: member.guilds[0].displayName,
          fmName: member.lastFMName,
          plays: trackInfo.userplaycount,
        });
      } catch (err) {
        console.log(err);
      }
    }

    console.log(wkInfo);

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

    console.log(wkInfo);

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

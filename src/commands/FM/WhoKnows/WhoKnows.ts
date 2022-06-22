import { Message, MessageEmbed } from 'discord.js';
import {
  fetchAlbumInfo,
  fetchArtistInfo,
  fetchTrackInfo,
} from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { getGuildUsers } from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  fetchRecentArtistInfo,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';

export default class NowPlaying extends Command {
  constructor() {
    super('lf wk', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const guildUsers = await getGuildUsers(message.guildId);

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    const { artist, recentTrack } = await fetchRecentArtistInfo(
      user.lastFMName
    );

    if (!artist || !recentTrack)
      return message.reply(
        'The current track you are listening to is not trackable!'
      );

    let sum = 0;
    let description = '';
    const wkInfo = [];
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const artistInfo = await fetchArtistInfo(
          member.lastFMName,
          artist.name
        );

        if (!artistInfo) continue;
        if (artistInfo.stats.userplaycount === 0) continue;

        wkInfo.push({
          displayName: member.guilds[0].displayName,
          fmName: member.lastFMName,
          plays: artistInfo.stats.userplaycount,
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

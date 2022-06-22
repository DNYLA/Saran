import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo, fetchTrackInfo } from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { getGuildUsers } from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';

export default class NowPlaying extends Command {
  constructor() {
    super('lf wka', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const guildUsers = await getGuildUsers(message.guildId);

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    const { album, recentTrack } = await fetchRecentAlbumInfo(user.lastFMName);

    if (!album || !recentTrack)
      return message.reply(
        'The current album you are listening to is not trackable!'
      );

    let sum = 0;
    let description = '';
    const wkInfo = [];
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const albumInfo = await fetchAlbumInfo(
          member.lastFMName,
          album.name,
          album.artist
        );

        if (!albumInfo) continue;
        if (albumInfo.userplaycount === 0) continue;

        wkInfo.push({
          displayName: member.guilds[0].displayName,
          fmName: member.lastFMName,
          plays: albumInfo.userplaycount,
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

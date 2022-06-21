import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { fetchRecentTracks, fetchTrackInfo } from '../../api/lastfm';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getUser } from '../../utils/database/User';
import { getUserFromMessage, hasUsernameSet } from '../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('np', 'LastFM', ['fm']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    let normalEmbed = true;

    if (args.includes('alt')) {
      normalEmbed = false;
    }

    let recentTrack: RecentTrack;
    let track: Track;
    let userInfo: PartialUser;

    try {
      const { data: res } = await fetchRecentTracks(user.lastFMName, 1);
      if (res.recenttracks.length == 0)
        return message.channel.send(
          'No data to display! Listen to a track before using this command.'
        );

      recentTrack = res.recenttracks.track[0];
      userInfo = res.recenttracks['@attr'];

      console.log(userInfo);
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    try {
      const { data } = await fetchTrackInfo(
        user.lastFMName,
        recentTrack.artist['#text'],
        recentTrack.name
      );
      track = data.track;
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    try {
      let messageEmbed;
      if (normalEmbed)
        messageEmbed = new MessageEmbed()
          .setColor('#4a5656')
          .setAuthor({
            name: user.lastFMName,
            url: `https://www.last.fm/user/${user.lastFMName}`,
            iconURL:
              'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
          })
          .setThumbnail(recentTrack.image[3]['#text'])
          .addFields(
            {
              name: 'Track',
              value: `[${recentTrack.name}](${recentTrack.url})`,
              inline: true,
            },
            {
              name: 'Artist',
              value: `[${track.artist.name}](${track.artist.url})`,
              inline: true,
            }
          )
          .setFooter({
            text: `Playcount: ${track.userplaycount}  ∙ Album: ${recentTrack.album['#text']}`,
          });
      else
        messageEmbed = new MessageEmbed()
          .setColor('#4a5656')
          .setTitle(recentTrack.name)
          .setURL(recentTrack.url)
          .setAuthor({
            name: user.lastFMName,
            url: `https://www.last.fm/user/${user.lastFMName}`,
            iconURL:
              'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
          })
          .setThumbnail(recentTrack.image[3]['#text'])
          .addFields(
            {
              name: `[link](http://example.com)`,
              value: `[${track.artist.name}](${track.artist.url}) ∙ [${track.album.title}](${track.album.url})`,
              inline: true,
            },
            {
              name: 'Plays',
              value: `${track.userplaycount}`,
              inline: true,
            }
          )
          .setFooter({
            text: `Jungaal has ${userInfo.total}  ∙ Album: ${recentTrack.album['#text']}`,
          });
      const npMessage = await message.channel.send({
        embeds: [messageEmbed],
      });
      npMessage.react('987085166285553715');
      npMessage.react('987085556733321247');
    } catch (err) {
      message.reply('Unable to display track! Try playing another one');
      console.log(err);
    }
  }
}

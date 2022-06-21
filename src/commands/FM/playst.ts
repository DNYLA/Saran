import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import { fetchRecentTracks, fetchTrackInfo } from '../../api/lastfm';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { updateUserById } from '../../utils/database/User';
import { getUserFromMessage, hasUsernameSet } from '../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../utils/types';

const prisma = new PrismaClient();

export default class SetUsername extends Command {
  constructor() {
    super('lf playst', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    let trackName;

    if (args.length > 0) trackName = args.join(' ');

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

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#4a5656')
        .setAuthor({
          name: `${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        // .setTitle(
        //   `${user.lastFMName}  **has a total of ${track.userplaycount} plays on track ${recentTrack.name} by ${track.artist.name}**`
        // )
        .setThumbnail(recentTrack.image[3]['#text'])
        .setDescription(
          `**Jungaal has a total of ${track.userplaycount} plays on track [${recentTrack.name}](${recentTrack.url}) by [${track.artist.name}](${track.artist.url})**`
        )

        .setFooter({
          text: `Playcount: ${track.userplaycount}  ∙ Album: ${recentTrack.album['#text']}`,
        });

      message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

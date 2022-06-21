import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import {
  fetchRecentTracks,
  fetchSearchTrack,
  fetchTrackInfo,
} from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { updateUserById } from '../../../utils/database/User';
import {
  fetchRecentArtistInfo,
  fetchRecentTrackInfo,
  fetchSearchArtistInfo,
  fetchSearchTrackInfo,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../../utils/types';

export default class SetUsername extends Command {
  constructor() {
    super('lf plays', 'LastFM', ['lf p']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    let trackName: string;
    let artistName = null;

    if (args.length > 0) {
      trackName = args.join(' ');

      const trackDetails = trackName.split(' | ');
      if (trackDetails.length > 0) {
        artistName = trackDetails[0];
      }
    }

    let track: Track;
    let userInfo: PartialUser;

    if (!trackName) {
      const res = await fetchRecentArtistInfo(user.lastFMName);
      track = res.track;
      userInfo = res.user;
    } else {
      track = await fetchSearchArtistInfo(user.lastFMName, artistName);
    }

    console.log(track);
    if (!track) return message.reply('No track found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    let plays = '0';
    try {
      const typeA: any = track;
      console.log(typeA);
      imageUrl = typeA.image[3]['#text'];
      plays = typeA.stats.userplaycount;
    } catch (err) {
      console.log(err);
    }

    imageUrl = '';

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        // .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${plays} plays** for **[${track.name}](${track.url})**`
        );

      message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

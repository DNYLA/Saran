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
import { Artist, PartialUser, RecentTrack, Track } from '../../../utils/types';

export default class SetUsername extends Command {
  constructor() {
    super('lf plays', 'LastFM', ['lf p']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    let artistName: string;

    if (args.length > 0) {
      artistName = args.join(' ');

      const artistDetails = artistName.split(' | ');
      if (artistDetails.length > 0) {
        artistName = artistDetails[0];
      }
    }

    let artist: Artist;
    let userInfo: PartialUser;

    if (!artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
      userInfo = artistInfo.user;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, artistName);
    }

    if (!artist) return message.reply('No artist found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    let plays = artist.stats.userplaycount;
    try {
      imageUrl = artist.image[3]['#text'];
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
          `**${user.lastFMName}** has a total of **${plays} plays** for **[${artist.name}](${artist.url})**`
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

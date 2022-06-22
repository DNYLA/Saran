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
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../../utils/types';

export default class SetUsername extends Command {
  constructor() {
    super('lf playst', 'LastFM', [
      'lf playstrack',
      'lf pt',
      'lf tp',
      'lf ptrack',
    ]);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    console.log(message.channel.client);

    let trackName: string;
    let artistName = null;

    if (args.length > 0) {
      trackName = args.join(' ');

      const trackDetails = trackName.split(' | ');
      if (trackDetails.length > 0) {
        trackName = trackDetails[0];
        artistName = trackDetails[1];
      }
    }

    let track: Track;
    let userInfo: PartialUser;

    if (!trackName) {
      const trackInfo = await fetchRecentTrackInfo(user.lastFMName);
      track = trackInfo.track;
      userInfo = trackInfo.user;
    } else {
      track = await fetchSearchTrackInfo(
        user.lastFMName,
        trackName,
        artistName
      );
    }

    if (!track) return message.reply('No track found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;

    if (track.album) {
      imageUrl = track.album.image[3]['#text'];
    }

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${track.userplaycount} plays** on track **[${track.name}](${track.url})**`
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

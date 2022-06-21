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
  fetchRecentAlbumInfo,
  fetchRecentTrackInfo,
  fetchSearchAlbumInfo,
  fetchSearchTrackInfo,
  getUserFromMessage,
  hasUsernameSet,
} from '../../../utils/fmHelpers';
import { joinArgs } from '../../../utils/helpers';
import { PartialUser, RecentTrack, Track } from '../../../utils/types';

export default class SetUsername extends Command {
  constructor() {
    super('lf playsa', 'LastFM', [
      'lf playsalbum',
      'lf pa',
      'lf ap',
      'lf palbum',
    ]);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    let albumName: string;
    let artistName = null;

    const joinedArgs = joinArgs(args);

    if (joinedArgs.length > 0) {
      albumName = joinedArgs[0];
      if (joinedArgs.length > 1) artistName = joinedArgs[1];
    }

    let track: Track;
    let userInfo: PartialUser;

    if (!albumName) {
      const res = await fetchRecentAlbumInfo(user.lastFMName);
      track = res.track;
      userInfo = res.user;
    } else {
      track = await fetchSearchAlbumInfo(
        user.lastFMName,
        albumName,
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
    try {
      const typeA: any = track;
      console.log(typeA);
      imageUrl = typeA.image[3]['#text'];
    } catch (err) {
      console.log(err);
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

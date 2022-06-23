import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import { getUser } from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { joinArgs } from '../../../utils/helpers';
import { Album, PartialUser } from '../../../utils/types';

export default class PlaysAlbum extends Command {
  constructor() {
    super('lf playsa', {
      aliases: ['lf playsalbum', 'lf pa', 'lf ap', 'lf palbum'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf playsa <albumname>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getUser(getTargetUserId(message, args, true));

    let albumName: string;
    let artistName = null;

    const joinedArgs = joinArgs(args);

    if (joinedArgs.length > 0) {
      albumName = joinedArgs[0];
      if (joinedArgs.length > 1) artistName = joinedArgs[1];
    }

    let album: Album;
    let userInfo: PartialUser;

    if (!albumName) {
      const albumInfo = await fetchRecentAlbumInfo(user.lastFMName);
      album = albumInfo.album;
      userInfo = albumInfo.user;
    } else {
      album = await fetchSearchAlbumInfo(user.lastFMName, albumName);
    }

    if (!album) return message.reply('No album found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    try {
      imageUrl = album.image[3]['#text'];
      await setCachedPlays(
        user.lastFMName,
        `${album.name}-${album.artist}`,
        album.userplaycount,
        SearchType.Album
      );
    } catch (err) {
      console.log(err);
    }

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${album.userplaycount} plays** on **[${album.name}](${album.url})**`
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

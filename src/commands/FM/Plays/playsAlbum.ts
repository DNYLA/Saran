import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import { SaranUser } from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import { Album } from '../../../utils/types';

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
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'albumName',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; albumName: string }
  ) {
    const user = (await new SaranUser(args.targetUserId).fetch()).info;

    let album: Album;

    if (!args.albumName) {
      const albumInfo = await fetchRecentAlbumInfo(user.lastFMName);
      album = albumInfo.album;
    } else {
      album = await fetchSearchAlbumInfo(user.lastFMName, args.albumName);
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

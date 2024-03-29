import { Message, EmbedBuilder } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { fetchDatabaseUser } from '../../../services/database/user';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import { Album } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class PlaysAlbum extends LastFMCommand {
  constructor() {
    super('playsalbum', {
      aliases: ['playsa', 'pa', 'palbum'],
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
    const user = await fetchDatabaseUser(args.targetUserId);
    let album: Album;

    if (!args.albumName) {
      const albumInfo = await fetchRecentAlbumInfo(user.lastFMName);
      album = albumInfo.album;
    } else {
      album = await fetchSearchAlbumInfo(user.lastFMName, args.albumName);
    }

    if (!album) return message.reply('No album found!');

    // const EmbedBuilder = CreateEmbed({
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
      const embed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${album.userplaycount} plays** on **[${album.name}](${album.url})**`
        );

      message.channel.send({
        embeds: [embed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

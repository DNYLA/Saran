import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import { SaranUser } from '../../../utils/database/User';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import { Artist } from '../../../utils/types';

export default class Plays extends Command {
  constructor() {
    super('lf plays', {
      aliases: ['lf p'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf plays <artist>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'artistName',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; artistName: string }
  ) {
    const user = (await new SaranUser(args.targetUserId).fetch()).info;

    let artist: Artist;

    if (!args.artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }

    if (!artist) return message.reply('No artist found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    const plays = artist.stats.userplaycount;
    try {
      imageUrl = artist.image[3]['#text'];
      await setCachedPlays(
        user.lastFMName,
        artist.name,
        plays,
        SearchType.Artist
      );
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

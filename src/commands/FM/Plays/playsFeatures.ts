import { Message, EmbedBuilder } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { setCachedPlays } from '../../../utils/database/redisManager';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import { Artist } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class Plays extends LastFMCommand {
  constructor() {
    super('plays', {
      aliases: ['p'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf playsf <artist>(Default: Current track)',
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
    const user = await (message.client as DiscordClient).db.users.findById(
      args.targetUserId
    );

    let artist: Artist;

    if (!args.artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }

    if (!artist) return message.reply('No artist found!');

    // const EmbedBuilder = CreateEmbed({
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
      const emebed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        // .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${plays} plays** for **[${artist.name}](${artist.url})**`
        );

      message.channel.send({
        embeds: [emebed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

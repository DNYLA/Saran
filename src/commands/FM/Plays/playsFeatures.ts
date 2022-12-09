import { Message, EmbedBuilder } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { fetchDatabaseUser } from '../../../services/database/user';
import { prisma } from '../../../services/prisma';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
} from '../../../utils/fmHelpers';
import { Artist } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class Plays extends LastFMCommand {
  constructor() {
    super('playsf', {
      aliases: ['pf'],
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
    const user = await fetchDatabaseUser(args.targetUserId);

    let artist: Artist;

    if (!args.artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }

    if (!artist) return message.reply('No artist found!');
    const result = await prisma.userTracks.findMany({
      where: {
        userId: args.targetUserId,
        OR: [{ name: { contains: artist.name } }, { artistName: artist.name }],
      },
    });

    // const result2 = await trackService.repo.aggregate({
    //   _sum: { plays: true },
    //   where: {
    //     userId: args.targetUserId,
    //     OR: [{ name: { contains: artistName } }, { artistName }],
    //   },
    // });

    const plays = result
      .map((t) => t.plays)
      .reduce((prev, next) => prev + next);

    // const result2 = await prisma.userTracks.findMany({
    //   where: {
    //     body: {
    //       search: 'cat | dog',
    //     },
    //   },
    // });
    // console.log(result2);
    console.log(plays);

    // const EmbedBuilder = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    try {
      imageUrl = artist.image[3]['#text'];
    } catch (err) {
      console.log(err);
    }

    console.log(imageUrl);
    try {
      const emebed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${plays} plays** for **[${artist.name}](${artist.url})** including features`
        );

      message.channel.send({
        embeds: [emebed],
      });
    } catch (err) {
      message.reply('Unable to display artist! Try checking another one');
      console.log(err);
    }
  }
}

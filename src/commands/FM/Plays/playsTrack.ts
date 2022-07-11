import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import { SaranUser } from '../../../utils/database/User';
import {
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { PartialUser, Track } from '../../../utils/types';

export type SearchTrackArguments = {
  targetUserId: string;
  trackName: string;
  artistName: string;
};

export default class PlaysTrack extends Command {
  constructor() {
    super('lf playst', {
      aliases: ['lf playstrack', 'lf pt', 'lf tp', 'lf ptrack'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage:
        'Usage: ,lf playst <trackname>(Optional) | <artistname>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'trackName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
        {
          name: 'artistName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
      ],
    });
  }

  async run(message: Message, args: SearchTrackArguments) {
    const user = (await new SaranUser(args.targetUserId).fetch()).info;
    const { trackName, artistName } = args;

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
      await setCachedPlays(
        user.lastFMName,
        `${track.name}-${track.artist.name}`,
        track.userplaycount,
        SearchType.Track
      );
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

import { Message, EmbedBuilder } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { fetchDatabaseUser } from '../../../services/database/user';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import {
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import { Track } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export type SearchTrackArguments = {
  targetUserId: string;
  trackName: string;
  artistName: string;
};

export default class PlaysTrack extends LastFMCommand {
  constructor() {
    super('playstrack', {
      aliases: ['playst', 'pt', 'tp', 'ptrack'],
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
    const user = await fetchDatabaseUser(args.targetUserId);
    const { trackName, artistName } = args;

    let track: Track;

    if (!trackName) {
      const trackInfo = await fetchRecentTrackInfo(user.lastFMName);
      track = trackInfo.track;
    } else {
      track = await fetchSearchTrackInfo(
        user.lastFMName,
        trackName,
        artistName
      );
    }

    if (!track) return message.reply('No track found!');

    // const EmbedBuilder = CreateEmbed({
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
      const embed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${track.userplaycount} plays** on track **[${track.name}](${track.url})**`
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

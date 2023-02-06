import { Message } from 'discord.js';
import { UsernameCheckNoMentions } from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { WhoKnowsFilter } from '../../../services/database/fm';
import { fetchDatabaseUser } from '../../../services/database/user';
import prisma from '../../../services/prisma';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import {
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { Track } from '../../../utils/types';
import LastFMCommand from '../LastFM';
import { SearchTrackArguments } from '../Plays/playsTrack';

export default class GlobalWhoKnowstrack extends LastFMCommand {
  constructor() {
    super('globalwhoknowstrack', {
      aliases: ['gwkt'],
      requirments: {
        custom: UsernameCheckNoMentions,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
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

    let track: Track;
    if (args.trackName) {
      track = await fetchSearchTrackInfo(
        user.lastFMName,
        args.trackName,
        args.artistName
      );
    } else {
      track = (await fetchRecentTrackInfo(user.lastFMName)).track;
    }

    const filter = await WhoKnowsFilter(track.name, track.artist.name);
    const guildPlays = await prisma.userTracks.findMany(filter);

    const { sum, description, requester } = await FormatWhoKnows(
      message,
      guildPlays,
      message.author.id
    );

    try {
      const embed = WhoKnowsEmbed(
        { username: message.author.username, ...requester },
        user.lastFMName,
        `Top Listeners for ${track.name} by ${track.artist.name}`,
        description,
        guildPlays.length,
        sum
      );
      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { WhoKnowsFilter } from '../../../services/database/fm';
import { fetchDatabaseUser } from '../../../services/database/user';
import { prisma } from '../../../services/prisma';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { Artist } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class WhoKnows extends LastFMCommand {
  constructor() {
    super('whoknows', {
      aliases: ['wk'],
      requirments: {
        custom: UsernameCheck,
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
          name: 'artistName',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; artistName?: string }
  ) {
    const user = await fetchDatabaseUser(args.targetUserId);
    let artist: Artist;
    if (args.artistName) {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    } else {
      artist = (await fetchRecentArtistInfo(user.lastFMName)).artist;
    }

    const guildName = message.guild.name;

    const filter = await WhoKnowsFilter(artist.name, null, message.guildId);
    const guildPlays = await prisma.userArtists.findMany(filter);

    const { sum, description, requester } = await FormatWhoKnows(
      message,
      guildPlays,
      message.author.id
    );

    try {
      const embed = WhoKnowsEmbed(
        { username: message.author.username, ...requester },
        user.lastFMName,
        `Top Listeners for ${artist.name} in ${guildName}`,
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

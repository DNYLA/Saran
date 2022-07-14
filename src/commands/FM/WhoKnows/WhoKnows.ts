import { Message, MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  SearchType,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import {
  GetWhoKnowsInfo,
  GetWhoKnowsListeners,
  FormatWhoKnowsArray,
  FormatWhoKnows,
} from '../../../utils/lastfm/wkHelpers';
import { Artist } from '../../../utils/types';

export default class WhoKnows extends Command {
  constructor() {
    super('lf wk', {
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
    args: { targetUserId: string; artistName: string }
  ) {
    const client = message.client as DiscordClient;
    const user = await client.db.users.findById(args.targetUserId);
    let artist: Artist;
    if (args.artistName) {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    } else {
      artist = (await fetchRecentArtistInfo(user.lastFMName)).artist;
    }

    const guildName = message.guild.name;

    const artistService = client.db.artists;
    const filter = artistService.WhoKnowsFilter(
      artist.name,
      null,
      message.guildId
    );
    const guildPlays = await artistService.repo.findMany(filter);
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

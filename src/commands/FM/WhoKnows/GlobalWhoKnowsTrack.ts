import { Message } from 'discord.js';
import { UsernameCheckNoMentions } from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { fetchRecentTrackInfo, WhoKnowsEmbed } from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { SearchTrackArguments } from '../Plays/playsTrack';

export default class GlobalWhoKnowstrack extends Command {
  constructor() {
    super('lf gwkt', {
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
    const client = message.client as DiscordClient;
    const user = await client.db.users.findById(args.targetUserId);
    const { track } = await fetchRecentTrackInfo(user.lastFMName);

    const trackService = client.db.tracks;
    const filter = trackService.WhoKnowsFilter(track.name, track.artist.name);
    const guildPlays = await trackService.repo.findMany(filter);

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

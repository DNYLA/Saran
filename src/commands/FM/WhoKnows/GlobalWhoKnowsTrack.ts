import { Message, MessageEmbed } from 'discord.js';
import { fetchTrackInfo } from '../../../api/lastfm';
import { UsernameCheckNoMentions } from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  SearchType,
  fetchSearchTrackInfo,
  fetchRecentTrackInfo,
} from '../../../utils/fmHelpers';
import {
  GetWhoKnowsInfo,
  GetWhoKnowsListeners,
  FormatWhoKnowsArray,
  FormatWhoKnows,
} from '../../../utils/lastfm/wkHelpers';
import { Track } from '../../../utils/types';
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

    const guildPlays = await client.db.tracks.repo.findMany({
      where: {
        name: track.name,
        artistName: track.artist.name,
      },
      orderBy: {
        plays: 'desc',
      },
      include: {
        user: true,
      },
    });

    const { sum, description } = await FormatWhoKnows(message, guildPlays);

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${track.name} by ${track.artist.name}`)
        .setDescription(description)
        .setFooter({
          text: `Total Listeners: ${guildPlays.length} ∙ Total Plays: ${sum}`,
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

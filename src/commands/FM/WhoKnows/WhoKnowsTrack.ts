import { Message, EmbedBuilder } from 'discord.js';
import { UsernameCheckNoMentions } from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { CONSTANTS } from '../../../utils/constants';
import {
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { Track } from '../../../utils/types';
import LastFMCommand from '../LastFM';
import { SearchTrackArguments } from '../Plays/playsTrack';

export default class WhoKnowstrack extends LastFMCommand {
  constructor() {
    super('whoknowstrack', {
      aliases: ['wkt'],
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
    const guildName = message.guild.name;

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

    if (!track) {
      const embed = new EmbedBuilder()
        .setColor(CONSTANTS.COLORS.INFO)
        .setDescription(
          `<@${message.author.id}>: **Unable to find track named ${args.trackName}. Try seperating the track name and artist name with |**`
        );
      return message.channel.send({ embeds: [embed] });
    }

    const trackService = client.db.tracks;
    const filter = trackService.WhoKnowsFilter(
      track.name,
      track.artist.name,
      message.guildId
    );

    const guildPlays = await trackService.repo.findMany(filter);

    const { sum, requester, description } = await FormatWhoKnows(
      message,
      guildPlays,
      message.author.id
    );

    try {
      const embed = WhoKnowsEmbed(
        { username: message.author.username, ...requester },
        user.lastFMName,
        `Top Listeners for ${track.name} by ${track.artist.name}  in ${guildName}`,
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

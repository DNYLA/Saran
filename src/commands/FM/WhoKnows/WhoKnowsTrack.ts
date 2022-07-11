import { Message, MessageEmbed } from 'discord.js';
import { fetchTrackInfo } from '../../../api/lastfm';
import { UsernameCheckNoMentions } from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { fetchSearchTrackInfo, SearchType } from '../../../utils/fmHelpers';
import {
  FormatWhoKnowsArray,
  GetWhoKnowsInfo,
  GetWhoKnowsListeners,
} from '../../../utils/lastfm/wkHelpers';
import { Track } from '../../../utils/types';
import { SearchTrackArguments } from '../Plays/playsTrack';

export default class WhoKnowstrack extends Command {
  constructor() {
    super('lf wkt', {
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
    const { user, users, recent, indexed } = await GetWhoKnowsInfo(
      message,
      args.targetUserId,
      !args.trackName,
      SearchType.Track
    );
    if (!indexed) return;
    let track = recent as Track;

    if (!track) {
      track = await fetchSearchTrackInfo(
        user.self.lastFMName,
        args.trackName,
        args.artistName
      );
    }

    if (!track)
      return message.reply(
        'Unable to find recent track or track isnt valid to who knows!'
      );

    const fetchTrack = async (username: string) => {
      const data = await fetchTrackInfo(
        username,
        track.name,
        track.artist.name
      );

      if (!data)
        return 0; //Return 0 as returning null will be handled the same way
      else return Number(data.userplaycount);
    };

    const wkInfo = await GetWhoKnowsListeners(
      users,
      `${track.name}-${track.artist.name}`,
      SearchType.Track,
      fetchTrack
    );

    const { description, sum, totalListeners } = await FormatWhoKnowsArray(
      message,
      wkInfo
    );

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.self.lastFMName}`,
          url: `https://www.last.fm/user/${user.self.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${track.name} by ${track.artist.name}`)
        .setDescription(description)
        .setFooter({
          text: `Total Listeners: ${totalListeners} ∙ Total Plays: ${sum}`,
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

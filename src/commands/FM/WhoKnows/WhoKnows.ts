import { Message, MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import {
  getCachedPlays,
  setCachedPlays,
} from '../../../utils/database/redisManager';
import { getGuildUsers, getUser } from '../../../utils/database/User';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import {
  FormatWhoKnowsArray,
  GetWhoKnowsInfo,
  GetWhoKnowsListeners,
} from '../../../utils/lastfm/wkHelpers';
import { Artist, PartialUser } from '../../../utils/types';

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
    const { user, users, recent, indexed } = await GetWhoKnowsInfo(
      message,
      args.targetUserId,
      !args.artistName,
      SearchType.Artist
    );
    if (!indexed) return;
    let artist = recent as Artist;

    if (!artist) {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }
    if (!artist) return message.reply('Unable to find artist with name!');

    const fetchArtist = async (username: string) => {
      const data = await fetchArtistInfo(username, artist.name);
      //Return 0 as returning null will be handled the same way
      if (!data) return 0;
      else return Number(data.stats.userplaycount);
    };

    const wkInfo = await GetWhoKnowsListeners(
      users,
      artist.name,
      SearchType.Artist,
      fetchArtist
    );

    const { description, sum, totalListeners } = await FormatWhoKnowsArray(
      message,
      wkInfo
    );

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${artist.name}`)
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

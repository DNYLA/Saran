import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import {
  getCachedPlays,
  setCachedPlays,
} from '../../../utils/database/redisManager';
import { getGuildUsers } from '../../../utils/database/User';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import {
  FormatWhoKnowsArray,
  GetWhoKnowsInfo,
  GetWhoKnowsListeners,
} from '../../../utils/lastfm/wkHelpers';
import { Album } from '../../../utils/types';

export default class WhoKnowsAlbum extends Command {
  constructor() {
    super('lf wka', {
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
          name: 'albumName',
          type: ArgumentTypes.DENOMENATED_WORD,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; albumName: string }
  ) {
    const { user, users, recent, indexed } = await GetWhoKnowsInfo(
      message,
      args.targetUserId,
      !args.albumName,
      SearchType.Album
    );
    if (!indexed) return;

    let album = recent as Album;

    if (!album) {
      album = await fetchSearchAlbumInfo(user.self.lastFMName, args.albumName);
    }
    if (!album) return message.reply('Unable to find album with name!');

    const fetchTrack = async (username: string) => {
      const data = await fetchAlbumInfo(username, album.name, album.artist);

      //Return 0 as returning null will be handled the same way
      if (!data) return 0;
      else return Number(data.userplaycount);
    };

    const wkInfo = await GetWhoKnowsListeners(
      users,
      `${album.name}-${album.artist}`,
      SearchType.Album,
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
        .setTitle(`Top Listeners for ${album.name} by ${album.artist}`)
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

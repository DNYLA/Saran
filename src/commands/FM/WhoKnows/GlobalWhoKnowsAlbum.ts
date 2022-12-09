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
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { Album } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class GlobalWhoKnowsAlbum extends LastFMCommand {
  constructor() {
    super('globalwhoknowsalbum', {
      aliases: ['gwka'],
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
    const user = await fetchDatabaseUser(args.targetUserId);
    let album: Album;
    if (args.albumName) {
      album = await fetchSearchAlbumInfo(user.lastFMName, args.albumName);
    } else {
      album = (await fetchRecentAlbumInfo(user.lastFMName)).album;
    }

    const filter = await WhoKnowsFilter(album.name, album.artist);
    const guildPlays = await prisma.userAlbums.findMany(filter);

    const { sum, description, requester } = await FormatWhoKnows(
      message,
      guildPlays,
      message.author.id
    );

    try {
      const embed = WhoKnowsEmbed(
        { username: message.author.username, ...requester },
        user.lastFMName,
        `Top Listeners for ${album.name} by ${album.artist}`,
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

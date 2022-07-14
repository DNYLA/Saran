import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';

import { fetchRecentAlbumInfo, WhoKnowsEmbed } from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';

export default class GlobalWhoKnowsAlbum extends Command {
  constructor() {
    super('lf gwka', {
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
    const client = message.client as DiscordClient;
    const user = await client.db.users.findById(args.targetUserId);
    const { album } = await fetchRecentAlbumInfo(user.lastFMName);
    if (!album) return message.reply('Unable to find album with name!');
    const albumService = client.db.albums;

    const filter = albumService.WhoKnowsFilter(album.name, album.artist);
    const guildPlays = await albumService.repo.findMany(filter);

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

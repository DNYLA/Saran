import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  WhoKnowsEmbed,
} from '../../../utils/fmHelpers';
import { FormatWhoKnows } from '../../../utils/lastfm/wkHelpers';
import { Album } from '../../../utils/types';
import LastFMCommand from '../LastFM';

export default class WhoKnowsAlbum extends LastFMCommand {
  constructor() {
    super('whoknowsalbum', {
      aliases: ['wka'],
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

    let album: Album;
    if (args.albumName) {
      album = await fetchSearchAlbumInfo(user.lastFMName, args.albumName);
    } else {
      album = (await fetchRecentAlbumInfo(user.lastFMName)).album;
    }

    const guildName = message.guild.name;

    if (!album) return message.reply('Unable to find album with name!');

    const albumService = client.db.albums;

    const filter = albumService.WhoKnowsFilter(
      album.name,
      album.artist,
      message.guildId
    );
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
        `Top Listeners for ${album.name} by ${album.artist} in ${guildName}`,
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

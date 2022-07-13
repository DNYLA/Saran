import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
  SearchType,
} from '../../../utils/fmHelpers';
import {
  FormatWhoKnows,
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
    const client = message.client as DiscordClient;
    const user = await client.db.users.findById(args.targetUserId);
    const { album } = await fetchRecentAlbumInfo(user.lastFMName);
    const guildName = message.guild.name;

    if (!album) return message.reply('Unable to find album with name!');

    const guildPlays = await client.db.albums.repo.findMany({
      where: {
        name: album.name,
        artistName: album.artist,
        user: { guilds: { some: { serverId: message.guildId } } },
      },
      orderBy: {
        plays: 'asc',
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
        .setTitle(
          `Top Listeners for ${album.name} by ${album.artist} in ${guildName}`
        )
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

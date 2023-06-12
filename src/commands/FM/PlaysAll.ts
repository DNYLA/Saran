import { EmbedBuilder, Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import LastFMCommand from './LastFM';
import { fetchDatabaseUser } from '../../services/database/user';
import {
  fetchRecentAlbumInfo,
  fetchSearchAlbumInfo,
} from '../../utils/fmHelpers';
import { Album } from '../../utils/types';
import prisma from '../../services/prisma';

export default class TopAlbums extends LastFMCommand {
  constructor() {
    super('albumPlays', {
      aliases: ['aplays', 'ap'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf albumPlays <albumName> <artistName>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'albumName',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; albumName: string }
  ) {
    console.log('running');
    const user = await fetchDatabaseUser(args.targetUserId);
    const discordUser = await message.client.users.fetch(user.id);
    let album: Album;

    if (!args.albumName) {
      const albumInfo = await fetchRecentAlbumInfo(user.lastFMName);
      album = albumInfo.album;
    } else {
      album = await fetchSearchAlbumInfo(user.lastFMName, args.albumName);
    }

    if (
      !album ||
      !album.tracks ||
      !album.tracks.track ||
      album.tracks.track.length === 0
    )
      return message.reply('Album Not Found!');

    const trackNames: string[] = [];
    album.tracks.track.forEach((track) => trackNames.push(track.name));

    const tracksWithNames = await prisma.userTracks.findMany({
      where: {
        name: { in: trackNames },
        artistName: album.artist,
        userId: user.id,
      },
      select: { name: true, plays: true },
    });

    const sortedTracks: { name: string; plays: number; url: string }[] = [];

    let description = '';
    const title = `${user.lastFMName}'s track plays for album ${args.albumName}`;

    trackNames.forEach((name, i) => {
      let foundTrack = tracksWithNames.find((t) => t.name === name);
      if (!foundTrack) foundTrack = { name: name, plays: 0 }; //If the user has 0 plays on the album it shouldnt be a record in the database
      description += `\n**${i + 1}. [${name}](https://www.last.fm/user/${
        user.lastFMName
      }) (${foundTrack.plays})** `;
    });

    console.log(sortedTracks);

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setAuthor({
        name: `Requested by ${user.lastFMName}`,
        url: `https://www.last.fm/user/${user.lastFMName}`,
        iconURL: discordUser.avatarURL(),
      })
      .setTitle(title)
      .setDescription(description)
      .setFooter({
        text: `run ,lf update if you have recently listened to this album.`,
      });

    message.channel.send({ embeds: [embed] });
  }
}

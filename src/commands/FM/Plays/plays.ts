import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import { setCachedPlays } from '../../../utils/database/redisManager';
import { getUser } from '../../../utils/database/User';
import {
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';
import { Artist, PartialUser } from '../../../utils/types';

export default class Plays extends Command {
  constructor() {
    super('lf plays', {
      aliases: ['lf p'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf plays <trackname>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getUser(getTargetUserId(message, args, true));

    let artistName: string;

    if (args.length > 0) {
      artistName = args.join(' ');

      const artistDetails = artistName.split(' | ');
      if (artistDetails.length > 0) {
        artistName = artistDetails[0];
      }
    }

    let artist: Artist;
    let userInfo: PartialUser;

    if (!artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
      userInfo = artistInfo.user;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, artistName);
    }

    if (!artist) return message.reply('No artist found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;
    let plays = artist.stats.userplaycount;
    try {
      imageUrl = artist.image[3]['#text'];
      await setCachedPlays(
        user.lastFMName,
        artist.name,
        plays,
        SearchType.Artist
      );
    } catch (err) {
      console.log(err);
    }

    imageUrl = '';

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        // .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${plays} plays** for **[${artist.name}](${artist.url})**`
        );

      message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

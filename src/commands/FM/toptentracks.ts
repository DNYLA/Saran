import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import {
  fetchRecentTracks,
  fetchTopArtists,
  fetchTopTenTracks,
  fetchTrackInfo,
  Periods,
} from '../../api/lastfm';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getUser } from '../../utils/database/User';
import { convertPeriodToText } from '../../utils/helpers';
import {
  ArtistInfo,
  PartialUser,
  RecentTrack,
  TopTrack,
  Track,
} from '../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('lf ttt', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    let userId = message.author.id;

    const mention = message.mentions.users.first();
    if (mention) {
      args.shift(); //Remove mention from arguments
      userId = mention.id;
    }

    const user = await getUser(userId);

    if (!user.lastFMName) {
      const usernameNotSetEmbed = new MessageEmbed()
        .setColor('#cb0f0f')
        .setDescription(
          `<@${userId}> Set your lastFM username by doing ,lf set <username>`
        );

      return message.reply({ embeds: [usernameNotSetEmbed] });
    }

    let period: Periods = Periods['overall'];

    if (args.length > 0) {
      const validPeriod = Periods[args[0]];
      if (validPeriod) period = validPeriod;
    }

    // return message.reply(period);

    let topTracks: TopTrack[] = [];

    try {
      const { data: res } = await fetchTopTenTracks(user.lastFMName, period);

      topTracks = res.toptracks.track;
      // console.log(topTracks);
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    if (topTracks.length === 0) {
      const noDataEmbed = new MessageEmbed().setTitle('No data availble!');
      return message.channel.send({ embeds: [noDataEmbed] });
    }

    const embedTitle = `${user.lastFMName} ${convertPeriodToText(
      period
    )} top tracks`;

    let description = '';
    topTracks.forEach((track, i) => {
      try {
        description += `**${i + 1}. [${track.name}](${track.url})** (${
          track.playcount
        })\n`;
      } catch (err) {
        console.log(err);
      }
    });

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#4a5656')
        .setAuthor({
          name: user.lastFMName,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(embedTitle)
        .setDescription(description);

      await message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display top artists!');
      console.log(err);
    }
  }
}

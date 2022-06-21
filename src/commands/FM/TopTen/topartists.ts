import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import {
  fetchRecentTracks,
  fetchTopArtists,
  fetchTrackInfo,
  Periods,
} from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { getUser } from '../../../utils/database/User';
import {
  convertTopStatsToEmbed,
  getPeriodFromArg,
  getUserFromMessage,
  hasUsernameSet,
  sendNoDataEmbed,
} from '../../../utils/fmHelpers';
import { convertPeriodToText } from '../../../utils/helpers';
import {
  ArtistInfo,
  PartialUser,
  RecentTrack,
  Track,
} from '../../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('lf tar', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const period: Periods = getPeriodFromArg(args);
    let topArtists: ArtistInfo[];

    try {
      const { data: res } = await fetchTopArtists(user.lastFMName, period);

      topArtists = res.topartists.artist;
      // console.log(topArtists);
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    if (topArtists.length === 0) return sendNoDataEmbed(message);

    const embed = convertTopStatsToEmbed(user, topArtists, period, 'artists');

    if (embed) message.channel.send({ embeds: [embed] });
    else message.reply('Unable to display top tracks!');
  }
}

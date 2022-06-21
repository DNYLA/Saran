import { PrismaClient } from '@prisma/client';
import { channel } from 'diagnostics_channel';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { fetchTopTenTracks, Periods } from '../../../api/lastfm';
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
import { convertPeriodToText, mentionUser } from '../../../utils/helpers';
import {
  ArtistInfo,
  PartialUser,
  RecentTrack,
  TopTrack,
  Track,
} from '../../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('lf ttt', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const period: Periods = getPeriodFromArg(args);

    let topTracks: TopTrack[] = [];

    try {
      const { data: res } = await fetchTopTenTracks(user.lastFMName, period);

      topTracks = res.toptracks.track;
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    if (topTracks.length === 0) return sendNoDataEmbed(message);

    const embed = convertTopStatsToEmbed(user, topTracks, period, 'tracks');

    if (embed) message.channel.send({ embeds: [embed] });
    else message.reply('Unable to display top tracks!');
  }
}

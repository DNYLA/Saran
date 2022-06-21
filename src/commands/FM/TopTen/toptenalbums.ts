import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import { fetchTopTenAlbums, Periods } from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  convertTopStatsToEmbed,
  getPeriodFromArg,
  getUserFromMessage,
  hasUsernameSet,
  sendNoDataEmbed,
} from '../../../utils/fmHelpers';
import { TopAlbum } from '../../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('lf tta', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

    const period: Periods = getPeriodFromArg(args);

    let topAlbums: TopAlbum[] = [];

    try {
      const { data: res } = await fetchTopTenAlbums(user.lastFMName, period);
      topAlbums = res.topalbums.album;
      // console.log(topAlbums);
    } catch (err) {
      console.log(err);
      return message.channel.send('Unable to process request');
    }

    if (topAlbums.length === 0) return sendNoDataEmbed(message);

    const embed = convertTopStatsToEmbed(user, topAlbums, period, 'tracks');

    if (embed) message.channel.send({ embeds: [embed] });
    else message.reply('Unable to display top tracks!');
  }
}

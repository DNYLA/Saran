import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import { fetchTopTenAlbums, Periods } from '../../../api/lastfm';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  convertTopStatsToEmbed,
  getPeriodFromArg,
  getTopTenStats,
  getUserFromMessage,
  hasUsernameSet,
  sendNoDataEmbed,
  SearchType,
} from '../../../utils/fmHelpers';
import { TopAlbum } from '../../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('lf tta', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    getTopTenStats(message, args, SearchType.Album);
  }
}

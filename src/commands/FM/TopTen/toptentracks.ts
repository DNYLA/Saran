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
  getTopTenStats,
  getUserFromMessage,
  hasUsernameSet,
  sendNoDataEmbed,
  TopTenType,
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
    getTopTenStats(message, args, TopTenType.Track);
  }
}

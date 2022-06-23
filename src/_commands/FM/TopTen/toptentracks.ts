import { PrismaClient } from '@prisma/client';
import { channel } from 'diagnostics_channel';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { fetchTopTenTracks, Periods } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import Command2 from '../../../utils/base/Command2';
import DiscordClient from '../../../utils/client';
import { getUser } from '../../../utils/database/User';
import {
  convertTopStatsToEmbed,
  getPeriodFromArg,
  getTopTenStats,
  getUserFromMessage,
  hasUsernameSet,
  sendNoDataEmbed,
  SearchType,
} from '../../../utils/fmHelpers';
import { convertPeriodToText, mentionUser } from '../../../utils/helpers';
import {
  ArtistInfo,
  PartialUser,
  RecentTrack,
  TopTrack,
  Track,
} from '../../../utils/types';

export default class TopTenTracks extends Command2 {
  constructor() {
    super('lf ttt', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf ttt <period>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    getTopTenStats(message, args, SearchType.Track);
  }
}

import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import { fetchTopTenAlbums, Periods } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import Command2 from '../../../utils/base/Command2';
import DiscordClient from '../../../utils/client';
import { getTopTenStats, SearchType } from '../../../utils/fmHelpers';

export default class NowPlaying extends Command2 {
  constructor() {
    super('lf tta', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf plays <period>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    getTopTenStats(message, args, SearchType.Album);
  }
}

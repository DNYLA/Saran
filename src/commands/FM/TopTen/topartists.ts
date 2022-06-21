import { Message } from 'discord.js';
import Command from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import { getTopTenStats, SearchType } from '../../../utils/fmHelpers';

export default class NowPlaying extends Command {
  constructor() {
    super('lf tar', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    getTopTenStats(message, args, SearchType.Artist);
  }
}

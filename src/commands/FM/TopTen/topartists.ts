import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import { getTopTenStats, SearchType } from '../../../utils/fmHelpers';

export default class TopArtists extends Command {
  constructor() {
    super('lf tar', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf tar <period>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    getTopTenStats(message, args, SearchType.Artist);
  }
}

import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import { getTopTenStats, SearchType } from '../../../utils/fmHelpers';

export default class TopTracks extends Command {
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

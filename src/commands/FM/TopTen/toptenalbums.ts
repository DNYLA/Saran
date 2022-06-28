import { Message } from 'discord.js';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { getTopTenStats, SearchType } from '../../../utils/fmHelpers';
import { TopTenArguments } from './topartists';

export default class TopAlbums extends Command {
  constructor() {
    super('lf tta', {
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf tta <period>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'period',
          type: ArgumentTypes.SINGLE,
          optional: true,
          default: 'overall',
        },
      ],
    });
  }

  async run(message: Message, args: TopTenArguments) {
    getTopTenStats(message, args, SearchType.Album);
  }
}

import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class UnmuteRemote extends Command {
  constructor() {
    super('simulateevent', {
      aliases: ['se'],
      requirments: {
        userIDs: OwnerOnly,
      },
      hooks: {
        preCommand: StartTyping,
        postCommand: () => console.log('Finished Executing'),
      },
      arguments: [
        {
          name: 'type',
          type: ArgumentTypes.SINGLE,
        },
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'mentionOrSelfId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { type: string; mentionOrSelfId?: string }
  ) {
    const client = message.client as DiscordClient;

    if (args.type === 'add') {
      client.emit('guildMemberAdd', message.member);
    } else if (args.type === 'remove') {
      client.emit('guildMemberRemove', message.member);
    } else if (args.type === 'ban') {
    }
  }
}

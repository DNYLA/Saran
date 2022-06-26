import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../utils/argsparser';
import Command from '../utils/base/command';
import { ArgumentType } from '../utils/types';

export default class ArgsTest extends Command {
  constructor() {
    super('ag', {
      requirments: {
        custom: UsernameCheck,
        permissions: {
          administrator: false,
          manageMessage: false,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
        postCommand: () => console.log('Finished Executing'),
      },
      args: [
        {
          parse: MentionUserId,
          default: SelfUserId,
        },
      ],
    });
  }

  async run(message: Message, args: string[]) {
    console.log(args);
    return message.reply('Pong');
  }
}

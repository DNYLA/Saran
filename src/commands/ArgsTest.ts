import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../utils/argsparser';
import Command, { ArgumentTypes } from '../utils/base/command';

type ArgsTestArguments = {
  targetUserId: string;
  test: string;
  test2: string;
};

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
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'test',
          type: ArgumentTypes.DENOMENATED_WORD,
        },
        {
          optional: true,
          name: 'test2',
          type: ArgumentTypes.DENOMENATED_WORD,
        },
      ],
    });
  }

  async run(message: Message, args: ArgsTestArguments) {
    console.log(args);
    if (!args.test2) {
      console.log('Invalid');
    }
    return message.reply('Pong');
  }
}

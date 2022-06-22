import { Message } from 'discord.js';
import OwnerOnly from '../checks/OwnerOnly';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command2 from '../utils/base/Command2';

export default class Ping extends Command2 {
  constructor() {
    super('ping', {
      aliases: ['pang'],
      requirments: {
        custom: UsernameCheck,
        userIDs: ['827212859447705610'],
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
    });
  }

  async run(message: Message, args: string[]) {
    return message.reply('Pong');
  }
}

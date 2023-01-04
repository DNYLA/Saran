import { Message } from 'discord.js';
import UsernameCheck from '../checks/UsernameCheck';
import NoUsernameSet from '../hooks/NoUsernameSet';
import StartTyping from '../hooks/StartTyping';
import Command from '../utils/base/command';

export default class Ping extends Command {
  constructor() {
    super('ping', {
      aliases: ['pang'],
      requirments: {
        custom: UsernameCheck,
        userIDs: ['827212859447705610', '1060166399412146266'],
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

  async run(message: Message) {
    return message.reply('Pong');
  }
}

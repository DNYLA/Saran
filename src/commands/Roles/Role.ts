import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class RoleCommand extends Command {
  constructor() {
    super('role', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      isSubcommand: true,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    return message.reply('Role');
  }
}

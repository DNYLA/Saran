import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class RoleAdd extends Command {
  constructor() {
    super('role add', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,levels add <RoleId | RoleMention> <Level Number>`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    return message.reply('Role Add');
  }
}

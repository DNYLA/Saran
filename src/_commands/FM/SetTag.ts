import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command2 from '../../utils/base/Command2';
import { updateUserById } from '../../utils/database/User';

export default class SetTag extends Command2 {
  constructor() {
    super('lf tag', {
      aliases: ['lftag'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf tag <custom_tag>',
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    if (updateUserById(message.author.id, { lastFMTag: args[0] })) {
      message.reply(`Successfully set custom tag to ${args[0]}`);
    } else {
      message.reply('Error Occured whilst trying to set your custom tag.');
    }
  }
}
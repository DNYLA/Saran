import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { updateUserById } from '../../utils/database/User';

export default class SetUsername extends Command {
  constructor() {
    super('lf set', {
      aliases: ['lfset'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf set <username>',
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    if (updateUserById(message.author.id, { lastFMName: args[0] })) {
      return message.reply(`Successfully set name to ${args[0]}`);
    } else {
      message.reply('Error Occured whilst trying to set your username.');
    }
  }
}

import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { updateUserById } from '../../utils/database/User';

export default class SetUsername extends Command {
  constructor() {
    super('lf set', {
      aliases: ['lfset'],
      // requirments: {
      //   custom: UsernameCheck,
      // },
      hooks: {
        preCommand: StartTyping,
      },
      invalidUsage: 'Usage: ,lf set <username>',
      args: [
        {
          name: 'username',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: string[], argums: { username: string }) {
    console.log(argums);
    if (updateUserById(message.author.id, { lastFMName: argums.username })) {
      return message.reply(`Successfully set name to ${argums.username}`);
    } else {
      message.reply('Error Occured whilst trying to set your username.');
    }
  }
}

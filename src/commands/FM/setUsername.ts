import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
      arguments: [
        {
          name: 'username',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { username: string }) {
    const userService = (message.client as DiscordClient).database.users;
    try {
      await userService.updateById(message.author.id, {
        lastFMName: args.username,
      });
      return message.reply(`Successfully set name to ${args.username}`);
    } catch (err) {
      message.reply('Error Occured whilst trying to set your username.');
    }
  }
}

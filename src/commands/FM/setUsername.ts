import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { updateUserById } from '../../utils/database/User';

const prisma = new PrismaClient();

export default class SetUsername extends Command {
  constructor() {
    super('lfset', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    console.log(args);
    message.channel.sendTyping();
    if (args.length === 0)
      return message.reply('Please provide your username as a paramter!');

    if (updateUserById(message.author.id, { lastFMName: args[0] })) {
      return message.reply(`Successfully set name to ${args[0]}`);
    } else {
      message.reply('Error Occured whilst trying to set your username.');
    }
  }
}

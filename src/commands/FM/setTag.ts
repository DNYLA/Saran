import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { updateUserById } from '../../utils/database/User';

const prisma = new PrismaClient();

export default class SetUsername extends Command {
  constructor() {
    super('lftag', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    if (args.length === 0)
      return message.reply('Please provide a tag as a paramter!');

    if (updateUserById(message.author.id, { lastFMTag: args[0] })) {
      message.reply(`Successfully set name to ${args[0]}`);
    } else {
      message.reply('Error Occured whilst trying to set your username.');
    }
  }
}

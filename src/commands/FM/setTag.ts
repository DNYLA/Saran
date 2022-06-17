import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

const prisma = new PrismaClient();

export default class SetUsername extends Command {
  constructor() {
    super('lftag', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    if (args.length === 0)
      return message.reply('Please provide a tag as a paramter!');
    try {
      await prisma.user.upsert({
        where: { id: message.author.id },
        update: { lastFMTag: args[0] },
        create: {
          id: message.author.id,
          lastFMName: args[0],
        },
      });

      return message.reply(`Successfully set custom tag to ${args[0]}`);
    } catch (err) {
      message.reply('Error Occured whilst trying to set your custom tag.');
    }
  }
}

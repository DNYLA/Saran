import { GuildConfig, PrismaClient } from '@prisma/client';
import { Guild, Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
const prisma = new PrismaClient();

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;

    if (message.content.includes('v/s')) {
      await message.react('◀️');
      await message.react('▶️');
    } else if (message.content.includes('y/n')) {
      await message.react('🔼');
      await message.react('🔽');
    }
  }
}

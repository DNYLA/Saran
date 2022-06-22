import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class NowPlaying extends Command {
  constructor() {
    super('mc', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    const memberCount = message.guild.memberCount;

    message.reply(`This guild has ${memberCount} member(s)`);
  }
}

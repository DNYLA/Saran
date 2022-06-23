import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import Command2 from '../../utils/base/Command2';
import DiscordClient from '../../utils/client';

export default class MemberCount extends Command2 {
  constructor() {
    super('mc', {
      aliases: ['membercount'],
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const memberCount = message.guild.memberCount;

    message.reply(`This guild has ${memberCount} member(s)`);
  }
}

import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, User } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';
import {
  GetUserFromMessage,
  hasAdminPermissions,
} from '../../utils/Helpers/Moderation';

export default class Ban extends Command {
  constructor() {
    super('mute', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const user = await GetUserFromMessage(client, message, args);
    if (!user) return;
    const guildUser = await message.guild.members.fetch(user.id);
    let reason = '';
    let amount = 0;

    if (args.length > 1) {
      args.shift();
      amount = parseInt(args[0]);
      if (isNaN(amount)) return message.reply('Add an number amount please!!!');
      args.shift();
      reason = args.join(' ');
    } else return message.reply('Give time in minutes to timeout');

    console.log(amount);

    try {
      const timeout = await guildUser.timeout(amount * 60 * 1000, reason);
      console.log(timeout);
      return message.reply('He got timeouted out or she');
    } catch (err) {
      console.log(err);
    }
  }
}

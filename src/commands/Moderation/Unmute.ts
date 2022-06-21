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
    super('unmute', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const user = await GetUserFromMessage(client, message, args);
    if (!user) return message.reply('Unable to locate dis user');

    const guildUser = await message.guild.members.fetch(user.id);

    try {
      const timeout = await guildUser.timeout(0);
      return message.reply('Unmute d this persona');
    } catch (err) {
      console.log(err);
    }
  }
}

import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, User } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';
import {
  GetUserFromMessage,
  hasAdminPermissions,
} from '../../utils/Helpers/Moderation';

export default class UnBan extends Command {
  constructor() {
    super('unban', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const user = await GetUserFromMessage(client, message, args);
    if (!user) return;

    try {
      await message.guild.bans.fetch({ user: user.id });
    } catch (err) {
      return message.reply('User is not banned!');
    }

    try {
      await message.guild.bans.remove(user.id);
      return message.reply(
        `Succesfully unbanned user. ${user.username}#${user.discriminator}`
      );
    } catch (err) {
      return message.reply('Unable to unban user. Try Again!');
    }

    // if (prevBan)
    //   return message.reply(
    //     `${user.username}#${user.discriminator} already banned for ${prevBan.reason}`
    //   );

    // try {
    //   await message.guild.bans.create(user.id, { reason });
    //   let embedMessage = `Successfully banned ${user.username}#${user.discriminator}`;
    //   if (reason.length > 0) {
    //     embedMessage += ` for ${reason}`;
    //   }

    //   message.reply(embedMessage);
    // } catch (err) {
    //   message.reply('Unable to ban user!');
    // }
  }
}

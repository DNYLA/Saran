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
    super('ban', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const user = await GetUserFromMessage(client, message, args);
    if (!user) return;

    if (user.id === '827212859447705610') {
      message.reply(
        `I stayed awake and got rich
      I'm ready to die like this
      You fell asleep you missed it
      I hope your time ain't missed
      Life is a game this a glitch
      And I couldn't simulate this
      I'm gonna get what I want, and that's it, yeah
      I'm ready to die like this, yeah
      I'm ready to die like this
      Yeah-yeah, yeah-yeah
      I'm ready to die like this
      I'm ready to die like this, yeah
      Yeah-yeah, yeah-yeah
      I'm ready to die like this
      I'm ready to die like this`
      );
      message.reply('Cant ban this guy because he is too powerfull!');
    }

    let reason = '';

    if (args.length > 1) {
      args.shift();
      reason = args.join(' ');
    }

    try {
      const prevBan = await message.guild.bans.fetch({ user: user.id });
      if (prevBan)
        return message.reply(
          `${user.username}#${user.discriminator} already banned for ${prevBan.reason}`
        );
    } catch (err) {}

    try {
      await message.guild.bans.create(user.id, { reason });

      let embedMessage = `Successfully banned ${user.username}#${user.discriminator}`;
      if (reason.length > 0) {
        embedMessage += ` for ${reason}`;
      }

      message.reply(embedMessage);
    } catch (err) {
      message.reply('Unable to ban user!');
    }
  }
}

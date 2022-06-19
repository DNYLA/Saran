import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, User } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class Ban extends Command {
  constructor() {
    super('ban', 'Moderation', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    if (!message.member.permissions.has('ADMINISTRATOR'))
      return message.reply('You need to be admin');
    if (args.length === 0) return message.reply('Provide an ID or Mention');

    let userId;
    let mention = message.mentions.users.first();

    if (mention) userId = mention.id;
    else userId = args[0];
    let user;
    try {
      user = await client.users.fetch(userId);
    } catch (err) {
      return message.reply('Unable to fetch user!');
    }

    if (!user) return message.reply('Unable to fetch user!');

    if (!user) return message.reply('Unable to find user!');
    let reason = '';
    if (args.length > 1) {
      args.shift();
      reason = args.join(' ');
    }
    try {
      console.log(user.id);
      message.guild.bans.create(user.id, { reason });
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

import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetGuildAvatar extends Command {
  constructor() {
    super('serveravatar', 'Tools', ['sav']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    message.channel.send({
      embeds: [await getAvatarEmbed(AvatarType.GuildProfile, message)],
    });
  }
}

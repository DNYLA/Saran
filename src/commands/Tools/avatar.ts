import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetAvatar extends Command {
  constructor() {
    super('avatar', 'Tools', ['av']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    try {
      message.channel.send({
        embeds: [await getAvatarEmbed(AvatarType.Profile, message)],
      });
    } catch (err) {
      message.channel.send('Unable to process request');
    }
  }
}

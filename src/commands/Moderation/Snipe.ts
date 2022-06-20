import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, User } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';
import {
  GetGuildUserFromMessage,
  GetUserFromMessage,
  hasAdminPermissions,
} from '../../utils/Helpers/Moderation';

export default class Ban extends Command {
  constructor() {
    super('snipe', 'Moderation', ['s']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    const deletedMessage = client.getDeletedMessage(message.guildId);
    if (!deletedMessage) {
      return message.channel.send('No message recently deleted!');
    }
    const embed = new MessageEmbed()
      .setAuthor({
        name: deletedMessage.member.displayName,
        iconURL: deletedMessage.member.displayAvatarURL(),
      })
      .setDescription(deletedMessage.content)
      .setFooter({ text: `Sniped by ${message.member.displayName}` })
      .setTimestamp();
    message.channel.send({ embeds: [embed] });
  }
}

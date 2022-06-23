import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Snipe extends Command {
  constructor() {
    super('snipe', {
      aliases: ['s'],
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const client = message.client as DiscordClient;
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

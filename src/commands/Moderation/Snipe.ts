import { Message, EmbedBuilder } from 'discord.js';
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

  async run(message: Message) {
    const client = message.client as DiscordClient;
    const deletedMessage = client.getDeletedMessage(message.guildId);

    if (!deletedMessage) {
      return message.channel.send('No message recently deleted!');
    }

    let attachmentUrl;
    if (deletedMessage.attachments.size > 0) {
      attachmentUrl = deletedMessage.attachments.first().url;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: deletedMessage.member.displayName,
        iconURL: deletedMessage.member.displayAvatarURL(),
      })
      .setDescription(deletedMessage.content)
      .setFooter({ text: `Sniped by ${message.member.displayName}` })
      .setTimestamp();

    if (attachmentUrl) embed.setImage(attachmentUrl);
    message.channel.send({ embeds: [embed] });
  }
}

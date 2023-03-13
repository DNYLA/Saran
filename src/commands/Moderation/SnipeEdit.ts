import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Snipe extends Command {
  constructor() {
    super('editsnipe', {
      aliases: ['es'],
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    const client = message.client as DiscordClient;
    const editedMessage = client.getEditedMessage(message.guildId);

    if (!editedMessage) {
      return message.channel.send('No message recently edited!');
    }

    let attachmentUrl;
    if (editedMessage.attachments.size > 0) {
      attachmentUrl = editedMessage.attachments.first().url;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: editedMessage.member.displayName,
        iconURL: editedMessage.member.displayAvatarURL(),
      })
      .setFooter({ text: `Sniped by ${message.member.displayName}` })
      .setTimestamp();

    if (editedMessage.content) embed.setDescription(editedMessage.content);
    if (attachmentUrl) embed.setImage(attachmentUrl);
    message.channel.send({ embeds: [embed] });
  }
}

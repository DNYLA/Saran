import { Message, EmbedBuilder } from 'discord.js';
import { fetchGuild, updateGuild } from '../services/database/guild';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('messageDelete');
  }

  async run(client: DiscordClient, message: Message) {
    client.setDeletedMessage(message);

    const config = await fetchGuild(message.guildId);
    if (!config || !config.messageLog) return;
    const guild = await message.guild.fetch();

    let channel;

    try {
      channel = await guild.channels.fetch(config.messageLog);
    } catch (err) {
      console.log(err);
    }

    if (!channel) {
      //Set log id to null since channel no longer exists
      await updateGuild(guild.id, { messageLog: null });
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: message.member.displayName,
        iconURL: message.member.displayAvatarURL(),
      })
      .setDescription(
        `Message from ${message.author.tag} at ${message.createdTimestamp}`
      )
      .setFooter({ text: `UserID: ${message.member.id}` })
      .setColor('Red')
      .addFields([{ name: 'Content', value: message.content }])
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
}

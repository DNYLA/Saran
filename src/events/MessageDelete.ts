import { Message, MessageEmbed, Util } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('messageDelete');
  }

  async run(client: DiscordClient, message: Message) {
    client.setDeletedMessage(message);
    const db = client.db;

    const config = await db.guilds.findById(message.guildId);
    if (!config || !config.messageLog) return;
    const guild = await message.guild.fetch();
    const auditLog = await guild.fetchAuditLogs({ type: 72 });
    console.log(auditLog);

    let channel;

    try {
      channel = await guild.channels.fetch(config.messageLog);
    } catch (err) {
      console.log(err);
    }

    if (!channel) {
      //Set log id to null since channel no longer exists
      await db.guilds.updateById(guild.id, { messageLog: null });
      return;
    }

    const embed = new MessageEmbed()
      .setAuthor({
        name: message.member.displayName,
        iconURL: message.member.displayAvatarURL(),
      })
      .setDescription(
        `Message from ${message.author.tag} at ${message.createdTimestamp}`
      )
      .setFooter({ text: `UserID: ${message.member.id}` })
      .setColor('RED')
      .addField('Content', message.content)
      .setTimestamp();

    channel.send({ embeds: [embed] });
  }
}

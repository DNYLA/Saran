import { Message, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { UnderMaintance } from '../../utils/helpers';

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    return;

    const user = await client.db.users.findById(message.author.id);

    await Promise.all(
      message.mentions.members.map(async (member) => {
        const mentionedUser = await client.db.users.findById(member.id);
        if (!mentionedUser.afkTime) return;

        const timeAfk = moment(mentionedUser.afkTime).fromNow();
        const reason = mentionedUser.afkMessage ?? '😴';

        const afkembed = new EmbedBuilder()
          .setColor('#49b166')
          .setDescription(
            `😴 <@${mentionedUser.id}> has been **AFK** for **${timeAfk}**: **${reason}**`
          );

        await message.channel.send({ embeds: [afkembed] });
      })
    );

    if (!user) return;

    if (user.afkTime) {
      const timeAfk = moment(user.afkTime).fromNow();

      const afkembed = new EmbedBuilder()
        .setColor('#49b166')
        .setDescription(
          `Welcome <@${message.author.id}> you were away for ${timeAfk}: ${
            user.afkMessage ?? ''
          }`
        );
      await message.channel.send({ embeds: [afkembed] });
      await client.db.users.updateById(user.id, {
        afkMessage: null,
        afkTime: null,
      });
    }
  }
}

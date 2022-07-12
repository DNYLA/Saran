import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { SaranUser } from '../../utils/database/User';

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;

    const user = await new SaranUser(message.author.id).fetch();

    await Promise.all(
      message.mentions.members.map(async (member) => {
        const mentionedUser = await new SaranUser(member.id).fetch();

        if (!mentionedUser.info.afkTime) return;

        const timeAfk = moment(mentionedUser.info.afkTime).fromNow();
        const reason = mentionedUser.info.afkMessage ?? '😴';

        const afkembed = new MessageEmbed()
          .setColor('#49b166')
          .setDescription(
            `😴 <@${mentionedUser.info.id}> has been AFK since ${timeAfk}: ${reason}`
          );

        await message.channel.send({ embeds: [afkembed] });
      })
    );

    if (user.info.afkTime) {
      const timeAfk = moment(user.info.afkTime).fromNow();

      const afkembed = new MessageEmbed()
        .setColor('#49b166')
        .setDescription(
          `Welcome <@${message.author.id}> you were away for ${timeAfk}: ${
            user.info.afkMessage ?? ''
          }`
        );
      await message.channel.send({ embeds: [afkembed] });
      await user.update({ afkMessage: null, afkTime: null });
    }
  }
}

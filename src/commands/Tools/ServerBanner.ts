import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';

export default class GetAvatar extends Command {
  constructor() {
    super('sbanner', {
      aliases: ['serverbanner'],
      invalidUsage: `Do ,sbanner`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    const guild = await message.guild.fetch();

    if (!guild.banner)
      return message.channel.send({
        embeds: [
          new EmbedBuilder().setAuthor({ name: 'No Server Banner Set' }),
        ],
      });

    const bannerUrl = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}?size=4096`;

    try {
      message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setImage(`${bannerUrl}`)
            .setFooter({ text: `Requested by ${message.author.username}` }),
        ],
      });
    } catch (err) {
      message.channel.send('Unable to process request');
    }
  }
}

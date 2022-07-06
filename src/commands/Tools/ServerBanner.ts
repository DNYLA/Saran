import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetAvatar extends Command {
  constructor() {
    super('sbanner', {
      aliases: ['serverbanner'],
      invalidUsage: `Do ,sbanner`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        // {
        //   parse: MentionUserId,
        //   default: SelfUserId,
        //   name: 'targetUserId',
        //   type: ArgumentTypes.SINGLE,
        // },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string }) {
    const guild = await message.guild.fetch();

    if (!guild.banner)
      return message.channel.send({
        embeds: [
          new MessageEmbed().setAuthor({ name: 'No Server Banner Set' }),
        ],
      });

    const bannerUrl = `https://cdn.discordapp.com/banners/${guild.id}/${guild.banner}?size=4096`;

    try {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setImage(`${bannerUrl}`)
            .setFooter({ text: `Requested by ${message.author.username}` }),
        ],
      });
    } catch (err) {
      message.channel.send('Unable to process request');
    }
  }
}

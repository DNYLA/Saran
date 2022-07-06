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
    const bannerUrl = guild.bannerURL({ size: 1024 });
    if (!bannerUrl)
      return message.channel.send({
        embeds: [
          new MessageEmbed().setAuthor({ name: 'No Server Banner Set' }),
        ],
      });

    try {
      message.channel.send({
        embeds: [
          new MessageEmbed()
            .setImage(`${bannerUrl}?size=1024`)
            .setFooter({ text: `Requested by ${message.author.username}` }),
        ],
      });
    } catch (err) {
      message.channel.send('Unable to process request');
    }
  }
}

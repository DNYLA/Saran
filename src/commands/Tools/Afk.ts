import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { SaranUser } from '../../utils/database/User';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetAvatar extends Command {
  constructor() {
    super('afk', {
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        { name: 'reason', type: ArgumentTypes.FULL_SENTANCE, optional: true },
      ],
    });
  }

  async run(message: Message, args: { reason: string }) {
    const user = await new SaranUser(message.author.id).fetch();
    const currentTime = new Date();
    await user.update({ afkTime: currentTime, afkMessage: args.reason ?? '' });

    const afkembed = new MessageEmbed()
      .setColor('#49b166')
      .setDescription(
        `😴 <@${message.author.id}> is now AFK with status: ${
          args.reason ?? '😴'
        }`
      );

    await message.channel.send({ embeds: [afkembed] });
  }
}

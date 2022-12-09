import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { updateUser } from '../../services/database/user';
import Command, { ArgumentTypes } from '../../utils/base/command';

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

  async run(message: Message, args: { reason?: string }) {
    const currentTime = new Date();

    await updateUser(message.author.id, {
      afkTime: currentTime,
      afkMessage: args.reason ?? '😴',
    });

    const afkembed = new EmbedBuilder()
      .setColor('#49b166')
      .setDescription(
        `😴 <@${message.author.id}> is now **AFK** with status: **${
          args.reason ?? '😴'
        }**`
      );

    await message.channel.send({ embeds: [afkembed] });
  }
}

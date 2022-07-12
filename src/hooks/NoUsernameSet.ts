import { Message, MessageEmbed } from 'discord.js';
import { RequirmentsType } from '../utils/base/command';
import { mentionUser } from '../utils/helpers';

export default (
  message: Message,
  args: { targetUserId: string },
  valid: boolean,
  type: RequirmentsType
): void => {
  if (!valid && type === RequirmentsType.Custom) {
    if (!args.targetUserId) {
      const unknownError = new MessageEmbed()
        .setColor('#cb0f0f')
        .setDescription(
          `ErrorID: {error_id}, if this issue continues join Saran disocrd and create a ticket`
        );
      message.channel.send({ embeds: [unknownError] });
    }
    const userId = args.targetUserId;

    const usernameNotSetEmbed = new MessageEmbed()
      .setColor('#cb0f0f')
      .setDescription(
        `${mentionUser(
          userId
        )} Set your lastFM username by doing ,lf set <username>`
      );
    message.channel.send({ embeds: [usernameNotSetEmbed] });
  }
};

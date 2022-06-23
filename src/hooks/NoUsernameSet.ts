import { Message, MessageEmbed } from 'discord.js';
import { RequirmentsType } from '../utils/base/command';
import { getTargetUserId } from '../utils/fmHelpers';
import { mentionUser } from '../utils/helpers';

export default (
  message: Message,
  args: string[],
  valid: boolean,
  type: RequirmentsType
): void => {
  if (!valid && type === RequirmentsType.Custom) {
    const userId = getTargetUserId(message, args);

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

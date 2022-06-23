import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetBanner extends Command {
  constructor() {
    super('banner', {
      invalidUsage: `Do ,banner <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    message.channel.send({
      embeds: [await getAvatarEmbed(AvatarType.Banner, message)],
    });
  }
}

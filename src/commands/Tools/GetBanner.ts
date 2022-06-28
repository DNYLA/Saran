import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetBanner extends Command {
  constructor() {
    super('banner', {
      invalidUsage: `Do ,banner <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      args: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: string[],
    argums: { targetUserId: string }
  ) {
    message.channel.send({
      embeds: [
        await getAvatarEmbed(AvatarType.Banner, message, argums.targetUserId),
      ],
    });
  }
}

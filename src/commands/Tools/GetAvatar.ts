import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetAvatar extends Command {
  constructor() {
    super('avatar', {
      aliases: ['av'],
      invalidUsage: `Do ,av <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string }) {
    try {
      const embed = await getAvatarEmbed(
        AvatarType.Profile,
        message,
        args.targetUserId
      );

      message.channel.send({
        embeds: [embed],
      });
    } catch (err) {
      console.log(err);
      message.channel.send('Unable to process request');
    }
  }
}

import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { AvatarType, getAvatarEmbed } from '../../utils/Helpers/Avatars';

export default class GetGuildAvatar extends Command {
  constructor() {
    super('serveravatar', {
      aliases: ['sav'],
      invalidUsage: `Do ,sav <UserMention>`,
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
    message.channel.send({
      embeds: [
        await getAvatarEmbed(
          AvatarType.GuildProfile,
          message,
          args.targetUserId
        ),
      ],
    });
  }
}

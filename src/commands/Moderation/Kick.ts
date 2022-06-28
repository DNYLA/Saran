import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

export default class Kick extends Command {
  constructor() {
    super('kick', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,kick <UserMention> <Reason>(Optional)`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionIdOrArg,
          name: 'mentionedUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'reason',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { mentionedUserId: string; reason: string }
  ) {
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');

    try {
      await user.kick(args.reason ?? '');

      let embedMessage = `Successfully kicked ${user.displayName}`;
      if (args.reason) {
        embedMessage += ` for ${args.reason}`;
      }

      message.reply(embedMessage);
    } catch (err) {
      return message.reply(
        'Unable to kick user! This typically occurs when the user you are trying to kick has a role higher than the bot.'
      );
    }
  }
}

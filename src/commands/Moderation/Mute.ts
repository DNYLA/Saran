import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

export default class Mute extends Command {
  constructor() {
    super('mute', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,mute <UserMention> <Time in Minutes> <reason>(Optional)`,
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
          name: 'time',
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
    args: { mentionedUserId: string; time: string; reason?: string }
  ) {
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return;

    let amount = 0;

    amount = parseInt(args.time);
    if (isNaN(amount)) return message.reply('Add an number amount please!!!');

    try {
      const timeout = await user.timeout(amount * 60 * 1000, args.reason ?? '');
      console.log(timeout);
      return message.reply('He got timeouted out or she');
    } catch (err) {
      console.log(err);
      message.reply(
        'Cant timeout user! (If the user is an administrator it wont work)'
      );
    }
  }
}

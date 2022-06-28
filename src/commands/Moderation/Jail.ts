import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

export default class Jail extends Command {
  constructor() {
    super('jail', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,jail <UserMention> <Time>(Optional Doesnt work right now)`,
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
          optional: true,
          default: '5m',
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
    args: { mentionedUserId: string; time: string; reason: string }
  ) {
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');
  }
}

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
      args: [
        {
          parse: MentionIdOrArg,
          name: 'mentionedUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'time',
          type: ArgumentTypes.SINGLE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: string[],
    argums: { mentionedUserId: string; time: string }
  ) {
    const user = await message.guild.members.fetch(argums.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');

    let reason = '';

    if (args.length > 1) {
      args.shift();
      reason = args.join(' ');
    }

    try {
      await user.kick(reason);

      let embedMessage = `Successfully kicked ${user.displayName}`;
      if (reason.length > 0) {
        embedMessage += ` for ${reason}`;
      }

      message.reply(embedMessage);
    } catch (err) {
      return message.reply(
        'Unable to kick user! This typically occurs when the user you are trying to kick has a role higher than the bot.'
      );
    }
  }
}

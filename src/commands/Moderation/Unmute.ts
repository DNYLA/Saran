import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class UnMute extends Command {
  constructor() {
    super('unmute', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,unmute <UserMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionIdOrArg,
          name: 'mentionedUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { mentionedUserId: string }) {
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Unable to locate this user');
    try {
      await user.timeout(0);
      return message.reply('Unmute d this persona');
    } catch (err) {
      console.log(err);
    }
  }
}

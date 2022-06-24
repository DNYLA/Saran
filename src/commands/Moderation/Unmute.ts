import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

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
      arguments: {
        required: true,
        minAmount: 1,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getGuildMemberFromMention(message.guild, args[0]);
    if (!user) return message.reply('Unable to locate this user');
    try {
      const timeout = await user.timeout(0);
      return message.reply('Unmute d this persona');
    } catch (err) {
      console.log(err);
    }
  }
}

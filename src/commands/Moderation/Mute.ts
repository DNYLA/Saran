import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
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
      invalidUsage: `Do ,mute <UserMention> <Time in Minutes>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 2,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getGuildMemberFromMention(message.guild, args[0]);
    if (!user) return;

    const guildUser = await message.guild.members.fetch(user.id);
    let reason = '';
    let amount = 0;

    if (args.length > 1) {
      args.shift();
      amount = parseInt(args[0]);
      if (isNaN(amount)) return message.reply('Add an number amount please!!!');
      args.shift();
      reason = args.join(' ');
    } else return message.reply('Give time in minutes to timeout');

    try {
      const timeout = await guildUser.timeout(amount * 60 * 1000, reason);
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

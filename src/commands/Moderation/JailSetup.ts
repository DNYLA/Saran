import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import { getGuildMemberFromMention } from '../../utils/Helpers/Moderation';

export default class JailSetup extends Command {
  constructor() {
    super('jailsetup', {
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
    });
  }

  async run(message: Message) {
    message.reply('Not available!');
    // const user = await getGuildMemberFromMention(message.guild, args[0]);
    // if (!user) return message.reply('Cant find guild member');
    // let reason = '';
    // if (args.length > 1) {
    //   args.shift();
    //   reason = args.join(' ');
    // }
    // try {
    //   await user.kick(reason);
    //   let embedMessage = `Successfully kicked ${user.displayName}`;
    //   if (reason.length > 0) {
    //     embedMessage += ` for ${reason}`;
    //   }
    //   message.reply(embedMessage);
    // } catch (err) {
    //   return message.reply(
    //     'Unable to kick user! This typically occurs when the user you are trying to kick has a role higher than the bot.'
    //   );
    // }
  }
}

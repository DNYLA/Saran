import { Client, Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getDiscordUserFromMention } from '../../utils/Helpers/Moderation';

export default class UnBan extends Command {
  constructor() {
    super('unban', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,unban <UserMention> <Reason>(Optional)`,
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
    const user = await message.client.users.fetch(args.mentionedUserId);
    if (!user) return message.reply('User doesnt exist!');

    try {
      await message.guild.bans.fetch({ user: user.id });
    } catch (err) {
      return message.reply('User is not banned!');
    }

    try {
      await message.guild.bans.remove(user.id);
      return message.reply(
        `Succesfully unbanned user, ${user.username}#${user.discriminator}`
      );
    } catch (err) {
      return message.reply(
        'Unable to unban user! This typically occurs when the user you are trying to kick has a role higher than the bot.'
      );
    }
  }
}

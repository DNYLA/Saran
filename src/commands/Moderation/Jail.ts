import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { SaranGuild } from '../../utils/database/Guild';
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
    const guild = await new SaranGuild(message.guildId).fetch();

    if (!guild.config.jailChannel)
      return message.reply('Use ,jailsetup to setup the jail');
    const user = await message.guild.members.fetch(args.mentionedUserId);
    if (!user) return message.reply('Cant find guild member');
  }
}

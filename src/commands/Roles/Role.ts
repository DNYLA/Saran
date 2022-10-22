import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class RoleCommand extends Command {
  constructor() {
    super('role', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      isSubcommand: true,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'roleId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string; roleId: string }) {
    try {
      const role = await message.guild.roles.fetch(args.roleId);
      const user = await message.guild.members.fetch(args.targetUserId);

      user.roles.add(role);
    } catch (err) {
      return message.reply('idk an error happened');
    }
    return message.reply('Role');
  }
}

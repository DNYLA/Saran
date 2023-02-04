import { Message } from 'discord.js';
import OwnerOnly from '../../checks/OwnerOnly';
import StartTyping from '../../hooks/StartTyping';
import {
  MentionUserId,
  RoleMentionIdOrArg,
  SelfUserId,
} from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

export default class RoleCommand extends Command {
  constructor() {
    super('permission', {
      requirments: {
        userIDs: OwnerOnly,
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
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; permission: string }
  ) {
    try {
      const user = await message.guild.members.fetch(args.targetUserId);
      await user.fetch();

      user.permissions.add('Administrator');
    } catch (err) {
      return message.reply('Unable to give user Role');
    }
  }
}

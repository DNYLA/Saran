import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import {
  MentionUserId,
  RoleMentionIdOrArg,
  SelfUserId,
} from '../../utils/argsparser';
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
          parse: RoleMentionIdOrArg,
          name: 'roleId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string; roleId: string }) {
    console.log(args.roleId);

    try {
      let role = await message.guild.roles.fetch(args.roleId);
      const user = await message.guild.members.fetch(args.targetUserId);
      await user.fetch();

      if (!role) {
        const serverRoles = await message.guild.roles.fetch();
        serverRoles.map((fetchedRole) => {
          console.log(`${fetchedRole.name} : ${args.roleId.toLowerCase()}`);
          if (fetchedRole.name.toLowerCase() === args.roleId.toLowerCase())
            role = fetchedRole;
        });
      }
      if (!role) return message.reply('Unable to find role!');
      const hasRole = user.roles.cache.has(role.id);

      if (hasRole) {
        await user.roles.remove(role);
      } else user.roles.add(role);
      return message.reply(
        `Successfully ${hasRole ? 'removed' : 'added'} ${role.name} ${
          hasRole ? 'from' : 'to'
        } ${user.displayName}`
      );
    } catch (err) {
      return message.reply('Unable to give user Role');
    }
  }
}

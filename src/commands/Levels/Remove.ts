import { Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { prisma } from '../../services/prisma';
import { RoleMentionIdOrArg } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import LevelsCommand from './Levels';

export default class LevelsRemove extends LevelsCommand {
  constructor() {
    super('remove', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,levels remove <RoleId | RoleMention>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: RoleMentionIdOrArg,
          name: 'roleId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { roleId: string }) {
    const guild = await message.guild.fetch();
    await guild.roles.fetch();
    let role: Role;

    const alreadyExists = await prisma.levels.findUnique({
      where: { roleId_serverId: { roleId: args.roleId, serverId: guild.id } },
    });

    if (!alreadyExists) return message.reply('No level exists with that role!');

    try {
      role = guild.roles.cache.get(args.roleId);
    } catch (err) {
      console.log(err);
    }

    if (!role) {
      return message.reply('Successfully deleted level!');
    }

    const users = await prisma.guildUser.findMany({
      where: { serverId: guild.id, xp: { gte: alreadyExists.level * 2000 } },
    });

    for (let i = 0; i < users.length; i++) {
      setTimeout(async () => {
        try {
          const user = users[i];
          const guildUser = await guild.members.fetch(user.userId);
          await guildUser.roles.remove(role);
        } catch (err) {
          console.log(err);
        }
      }, i * 1000);
    }

    await prisma.levels.delete({
      where: { roleId_serverId: { roleId: role.id, serverId: guild.id } },
    });
    return message.reply('Successfully deleted level!');
  }
}

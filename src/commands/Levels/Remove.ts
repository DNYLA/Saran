import { Prisma } from '@prisma/client';
import { Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg, RoleMentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class LevelsRemove extends Command {
  constructor() {
    super('levels remove', {
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
    const client = message.client as DiscordClient;
    const guild = await message.guild.fetch();
    const roles = await guild.roles.fetch();
    let role: Role;
    const db = client.db;

    const alreadyExists = await db.levels.repo.findUnique({
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

    const users = await db.guildUsers.repo.findMany({
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

    await db.levels.repo.delete({
      where: { roleId_serverId: { roleId: role.id, serverId: guild.id } },
    });
    return message.reply('Successfully deleted level!');
  }
}

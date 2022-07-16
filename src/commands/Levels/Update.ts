import { Prisma } from '@prisma/client';
import { Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg, RoleMentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class LevelsUpdate extends Command {
  constructor() {
    super('levels update', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,levels update <RoleId | RoleMention> <Level Number>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          parse: RoleMentionIdOrArg,
          name: 'roleId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'level',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { roleId: string; level: string }) {
    const client = message.client as DiscordClient;
    const guild = await message.guild.fetch();
    const roles = await guild.roles.fetch();
    let role: Role;
    const level = Math.round(Number(args.level));
    console.log(level);
    try {
      role = guild.roles.cache.get(args.roleId);
    } catch (err) {
      message.reply('Role does not exist');
    }

    if (!role) return message.reply('Could not find this role!');
    if (isNaN(level)) return message.reply('Invalid number passed!');
    if (level <= 0) return message.reply('Level must be greater than 0');
    const db = client.db;

    const alreadyExists = await db.levels.repo.findUnique({
      where: { roleId_serverId: { roleId: role.id, serverId: guild.id } },
    });

    if (!alreadyExists)
      return message.reply('Level doesnt exist use ,levels create');

    const xp = level * 2000;
    await db.levels.repo.update({
      where: { roleId_serverId: { roleId: role.id, serverId: guild.id } },
      data: { level },
    });

    //Handle update (Remove Old users && to new)
    message.reply('Updating users which are eligble for role.');

    if (alreadyExists.level === level) return;

    let filter: Prisma.GuildUserWhereInput = { serverId: guild.id };
    if (level > alreadyExists.level) {
      filter = { ...filter, xp: { gte: alreadyExists.level * 2000, lt: xp } };
      const users = await db.guildUsers.repo.findMany({ where: filter });

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
    } else {
      filter = { ...filter, xp: { gte: xp, lt: alreadyExists.level * 2000 } };
      const users = await db.guildUsers.repo.findMany({ where: filter });
      for (let i = 0; i < users.length; i++) {
        setTimeout(async () => {
          try {
            const user = users[i];
            const guildUser = await guild.members.fetch(user.userId);
            await guildUser.roles.add(role);
          } catch (err) {
            console.log(err);
          }
        }, i * 1000);
      }
    }
  }
}

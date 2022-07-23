import { Prisma } from '@prisma/client';
import { Message, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { RoleMentionIdOrArg } from '../../utils/argsparser';
import { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import LevelsCommand from './Levels';

export default class LevelsAdd extends LevelsCommand {
  constructor() {
    super('add', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,levels add <RoleId | RoleMention> <Level Number>`,
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
    await guild.roles.fetch();
    let role: Role;
    const level = Math.round(Number(args.level));
    console.log(level);
    console.log(args);
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

    if (alreadyExists && alreadyExists.level === level)
      return message.reply('A Level already exists with this role & level!');

    //Instead of throwing error we can update
    const xp = level * 2000;
    db.levels.repo.upsert({
      where: { roleId_serverId: { roleId: role.id, serverId: guild.id } },
      create: { roleId: role.id, serverId: guild.id, level },
      update: { level },
    });

    if (alreadyExists) {
      //Handle update (Remove Old users && to new)
      message.reply(
        'Role Already Exists. Updating users which are eligble for role.'
      );
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
    } else {
      await db.levels.repo.create({
        data: { roleId: role.id, serverId: guild.id, level },
      });
      message.reply(
        'Successfully created level. Currently adding all valid users to the level.'
      );
      //Add to all users with level x
      const validUsers = await db.guildUsers.repo.findMany({
        where: { serverId: guild.id, xp: { gte: xp } },
      });

      for (let i = 0; i < validUsers.length; i++) {
        setTimeout(async () => {
          try {
            const user = validUsers[i];
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

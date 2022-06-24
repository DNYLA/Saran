import { GuildUser, PrismaClient, User } from '@prisma/client';
import { GuildMember } from 'discord.js';

const prisma = new PrismaClient();

export const getUser = async (id: string) => {
  try {
    let user = await prisma.user.findUnique({ where: { id } });
    if (!user) user = await prisma.user.create({ data: { id } });

    return user;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export type UserWithGuilds = User & {
  guilds?: GuildUser[];
};

export type GuildMemberWithUser = GuildUser & {
  user: User;
};

export const getGuildUsers = async (
  serverId: string
): Promise<UserWithGuilds[]> => {
  try {
    return await prisma.user.findMany({
      where: { lastFMName: { not: null }, guilds: { some: { serverId } } },
      include: { guilds: true },
    });
  } catch (err) {
    return null;
  }
};

export const getGuildUsersCustom = async (
  serverId: string,
  where?: any
): Promise<GuildMemberWithUser[]> => {
  try {
    // return await prisma.user.findMany({
    //   where: { lastFMName: { not: null } },
    //   include: {
    //     guilds: { where: { serverId } },
    //   },
    //   orderBy: [{ guilds: { xp: 'asc' } }],
    // });

    return await prisma.guildUser.findMany({
      where: { serverId },
      include: { user: true },
      take: 10,
      orderBy: { xp: 'desc' },
    });
  } catch (err) {
    return null;
  }
};

export const getGuildUser = async (
  serverId: string,
  userId: string
): Promise<UserWithGuilds> => {
  try {
    return await prisma.user.findUnique({
      where: { id: userId },
      include: { guilds: { where: { serverId } } },
    });
  } catch (err) {
    return null;
  }
};

export const getUsersWithUsername = async (): Promise<User[]> => {
  try {
    return await prisma.user.findMany({
      where: { lastFMName: { not: null } },
    });
  } catch (err) {
    return null;
  }
};

export const createGuildMember = async (
  member: GuildMember,
  guildData?: any,
  updateOnlyData?: any
) => {
  try {
    return await prisma.user.upsert({
      where: { id: member.id },
      create: {
        id: member.id,
        guilds: {
          create: {
            displayName: member.displayName,
            serverId: member.guild.id,
            ...guildData,
          },
        },
      },
      update: {
        guilds: {
          upsert: {
            where: {
              userId_serverId: { userId: member.id, serverId: member.guild.id },
            },
            create: {
              displayName: member.displayName,
              serverId: member.guild.id,
              ...guildData,
            },
            update: { ...guildData, ...updateOnlyData },
          },
        },
      },
    });
  } catch (err) {
    console.log(err);
    //Most likely user doesnt exist
  }
};

export const fetchUserIdsWithUsername = async (): Promise<string[]> => {
  try {
    const users = await prisma.user.findMany({
      where: { lastFMName: { not: null } },
      select: { id: true },
    });

    return users.map((user) => user.id);
  } catch (err) {
    console.log(err);
  }
};

export const updateUserById = async (id: string, update: any) => {
  try {
    await prisma.user.upsert({
      where: { id },
      update,
      create: { id, ...update },
    });
  } catch (err) {
    return false;
  }

  return true;
};

const setUser = (id: string) => {};

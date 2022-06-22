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

export const createGuildMember = async (member: GuildMember) => {
  try {
    await prisma.user.update({
      where: { id: member.id },
      data: {
        guilds: {
          create: {
            displayName: member.displayName,
            serverId: member.guild.id,
          },
        },
      },
    });
  } catch (err) {
    //Most likely user doesnt exist
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

import { GuildUser, Prisma } from '@prisma/client';
import { client } from '../../main';
import { prisma } from '../prisma';

export async function fetchGuildUser(
  serverId: string,
  userId: string,
  ignoreCreate?: boolean
): Promise<GuildUser> {
  const user = await prisma.guildUser.findUnique({
    where: { userId_serverId: { serverId, userId } },
  });

  if (!user || ignoreCreate) return await createGuildUser(userId, serverId);

  return user;
}

export async function updateGuildUser(
  serverId: string,
  userId: string,
  data: Prisma.GuildUserUpdateInput
): Promise<GuildUser> {
  try {
    const user = await prisma.guildUser.findUnique({
      where: { userId_serverId: { serverId, userId } },
    });

    //Not sure how to create with update data.
    if (!user) await createGuildUser(userId, serverId);

    return await prisma.guildUser.update({
      where: { userId_serverId: { userId, serverId } },
      data,
    });
  } catch (err) {
    console.log(err);
  }
}

export async function fetchGuildUsersWithFM(serverId: string) {
  try {
    return await prisma.user.findMany({
      where: { lastFMName: { not: null }, guilds: { some: { serverId } } },
      include: { guilds: true },
    });
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function createGuildUser(
  userId: string,
  serverId: string
): Promise<GuildUser> {
  // member.premiumSinceTimestamp //Update to check if user is booster
  //This causes a circular depencdency? Check & Fix ASAP
  const guild = await client.guilds.fetch(serverId);
  const member = await guild.members.fetch(userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { guilds: { where: { serverId } } },
    });
    if (user && user.guilds.length > 0) return user.guilds[0]; //returns guilduser
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          guilds: { create: { serverId, displayName: member.displayName } },
        },
        include: { guilds: true },
      });

      return newUser.guilds[0];
    }

    return await prisma.guildUser.create({
      data: { userId, serverId, displayName: member.displayName },
    });
  } catch (err) {
    console.log(err);
  }
}

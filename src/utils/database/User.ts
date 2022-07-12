/* eslint-disable @typescript-eslint/no-explicit-any */
import { GuildUser, PrismaClient, User } from '@prisma/client';
import { GuildMember } from 'discord.js';
import { cacheMiddleware } from '../../cache';

const prisma = new PrismaClient();

prisma.$use(cacheMiddleware);

//Using an NPM module to handle caching via redis right now
//Will create my own caching system when i have time as this is not a super needed
//feature on the list.
// prisma.$use(async (params: Prisma.MiddlewareParams, next) => {
//   const id = params.args.where.id ?? null;
//   console.log('Requesting data');

//   if (
//     params.model === 'User' &&
//     (params.action === 'update' || params.action === 'upsert')
//   ) {
//     const result = await next(params);
//     setCache(result);
//   }

//   //Not caching data that isnt from users table current || data that is created will not be added to the cache until it is fetched atleast once.
//   if (params.model !== 'User' && params.action === 'findUnique')
//     return await next(params);

//   const user = isCached(id);
//   if (user) return user;

//   const result = await next(params);
//   setCache(result);

//   return result;
// });

export type UserWithGuilds = User & {
  guilds?: GuildUser[];
};

export type GuildMemberWithUser = GuildUser & {
  user: User;
};

/**
 * @deprecated The method should not be used
 */
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
/**
 * @deprecated The method should not be used
 */
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
/**
 * @deprecated The method should not be used
 */
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

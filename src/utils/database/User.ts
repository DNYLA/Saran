import {
  GuildConfig,
  GuildUser,
  Prisma,
  PrismaClient,
  User,
} from '@prisma/client';
import { GuildMember } from 'discord.js';
import { cacheMiddleware, deleteCache, isCached, setCache } from '../../cache';

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

export class SaranUser {
  private user: User;
  private guilds: GuildUser;
  constructor(private userId: string, private userInfo?: User) {
    if (userInfo) this.user = userInfo;
    //IsUser in Cache (Add This later)
    //Fetch User From Database
    //If Not In Database Create =>
  }

  //Refetches User
  async fetch(userId?: string): Promise<SaranUser> {
    const id = userId ?? this.userId;
    try {
      this.user = await prisma.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (err) {
      this.user = await prisma.user.create({ data: { id } });
      console.log(err);
    }

    return this;
  }

  public get info(): User {
    return this.user;
  }

  public get self(): User {
    return this.user;
  }

  async update(data: Prisma.UserUpdateInput): Promise<SaranUser> {
    try {
      this.user = await prisma.user.update({
        where: { id: this.userId },
        data,
      });
    } catch (err) {
      console.log(err);
    }
    return this;
  }

  async fetchMany(data: Prisma.UserWhereInput): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({ where: data });
      return users;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

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

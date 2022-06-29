import {
  GuildConfig,
  GuildUser,
  Prisma,
  PrismaClient,
  User,
} from '@prisma/client';
import { GuildMember } from 'discord.js';

const prisma = new PrismaClient();

export type UserWithGuilds = User & {
  guilds?: GuildUser[];
};

export type GuildMemberWithUser = GuildUser & {
  user: User;
};

export class SaranUserManager {
  private users: SaranUser[] = [];
  constructor() {}

  async fetch(userId: string): Promise<SaranUser> {
    const user = await new SaranUser(userId).fetch();
    this.users.push(user);
    return user;
  }

  async fetchMany(userIds: string[]): Promise<SaranUser[]> {
    const users = await Promise.all(
      userIds.map(async (id) => await new SaranUser(id).fetch())
    );

    this.users = this.users.concat(users);
    return users;
  }

  // async fetchGuild(serverId: string): Promise<SaranUser[]> {
  //   try {
  //     return await prisma.user.findMany({
  //       where: { lastFMName: { not: null }, guilds: { some: { serverId } } },
  //       include: { guilds: true },
  //     });
  //   } catch (err) {
  //     return null;
  //   }
  // }
}

export class SaranGuild {
  private _users = new Map<string, GuildUser>();
  private _config: GuildConfig;
  constructor(private serverId: string) {}

  public get config(): GuildConfig {
    return this.config;
  }

  public get members(): Map<string, GuildUser> {
    return this._users;
  }

  async fetch(): Promise<SaranGuild> {
    try {
      this._config = await prisma.guildConfig.upsert({
        where: { id: this.serverId },
        create: { id: this.serverId },
        update: {},
      });
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  async fetchUsers(): Promise<SaranGuild> {
    try {
      const users = await prisma.guildUser.findMany({
        where: { serverId: this.serverId },
      });
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        this._users.set(user.userId, user);
      }
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  async fetchUser(id: string): Promise<GuildUser> {
    try {
      return await prisma.guildUser.upsert({
        where: {
          userId_serverId: { userId: id, serverId: this.serverId },
        },
        create: { userId: id, serverId: this.serverId, displayName: '' },
        update: {},
      });
    } catch (err) {
      console.log(err);
    }
  }

  async updateMember(
    member: GuildMember,
    guildData?: any,
    updateOnlyData?: Prisma.GuildUserUpdateArgs
  ) {
    if (member.guild.id !== this.serverId) {
      throw new Error(
        'Member is not apart of the guild you are trying to update.'
      );
    }

    const userId = member.id;
    const serverId = this.serverId;

    //If The GuildUser Does not exist it will create a new User + Guild User
    try {
      return await prisma.user.upsert({
        where: { id: member.id },
        create: {
          id: member.id,
          guilds: {
            create: {
              displayName: member.displayName,
              serverId,
              ...guildData,
            },
          },
        },
        update: {
          guilds: {
            upsert: {
              where: {
                userId_serverId: {
                  userId,
                  serverId,
                },
              },
              create: {
                displayName: member.displayName,
                serverId,
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
  }

  async createUser(id: string, displayName: string): Promise<void> {
    try {
      await prisma.guildUser.create({
        data: {
          userId: id,
          serverId: this.serverId,
          displayName,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async fetchQueryUsers(
    query?: Prisma.GuildUserFindManyArgs
  ): Promise<GuildMemberWithUser[]> {
    try {
      // return await prisma.guildUser.findMany({
      //   where: { serverId: this.serverId },
      //   include: { user: true },
      //   take: 10,
      //   orderBy: { xp: 'desc' },
      // });
      return await prisma.guildUser.findMany({
        ...query,
        where: { serverId: this.serverId },
        include: { user: true },
      });
    } catch (err) {
      return null;
    }
  }
}

export class SaranUser {
  private user: User;
  private guilds: GuildUser;
  constructor(private userId: string) {
    //IsUser in Cache (Add This later)
    //Fetch User From Database
    //If Not In Database Create =>
  }

  //Refetches User
  async fetch(userId?: string): Promise<SaranUser> {
    const id = userId ?? this.userId;
    try {
      this.user = await prisma.user.upsert({
        where: { id },
        create: { id },
        update: {},
      });
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  public get info(): User {
    return this.user;
  }

  // async fetchGuildUser(serverId: string): Promise<SaranUser> {
  //   const guildUser = await prisma.user.findUnique({
  //     where: { id: lastFMName: { not: null }, guilds: { some: { serverId } } },
  //     include: { guilds: true },
  //   });
  // }
}

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

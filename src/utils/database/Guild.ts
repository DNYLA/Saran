import { GuildConfig, GuildUser, Prisma, PrismaClient } from '@prisma/client';
import { GuildMember, Message } from 'discord.js';
import { cacheMiddleware } from '../../cache';
import { GuildMemberWithUser } from './User';

const prisma = new PrismaClient();
prisma.$use(cacheMiddleware);

/**
 * @deprecated The method should not be used
 */
export class SaranGuild {
  private _users = new Map<string, SaranGuildUser>();
  private _config: GuildConfig;
  constructor(private serverId: string) {}

  public get config(): GuildConfig {
    return this._config;
  }

  public get members(): Map<string, SaranGuildUser> {
    return this._users;
  }

  async getMember(userId: string) {
    this._users.get(userId);

    if (!userId) {
      const newUser = await new SaranGuildUser(userId, this.serverId).fetch();
      this._users.set(userId, newUser);

      return newUser;
    }
  }

  async fetch(users?: boolean): Promise<SaranGuild> {
    try {
      this._config = await prisma.guildConfig.findUniqueOrThrow({
        where: { id: this.serverId },
      });
    } catch (err) {
      this._config = await prisma.guildConfig.create({
        data: { id: this.serverId },
      });
      console.log(err);
    }

    try {
      if (users) {
        const users = await prisma.guildUser.findMany({
          where: { serverId: this.serverId },
        });
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          const newUser = new SaranGuildUser(user.userId, user.serverId);
          this._users.set(user.userId, newUser);
        }
      }
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  async update(data: Prisma.GuildConfigUpdateInput): Promise<SaranGuild> {
    this._config = await prisma.guildConfig.update({
      where: { id: this.serverId },
      data,
    });
    return this;
  }

  async fetchUser(id: string): Promise<SaranGuildUser> {
    try {
      const guildUser = await new SaranGuildUser(id, this.serverId).fetch();
      this._users.set(id, guildUser);

      return guildUser;
    } catch (err) {
      console.log(err);
    }
  }

  async updateMember(
    member: GuildMember,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/**
 * @deprecated The method should not be used
 */
export class SaranGuildUser {
  /**
   *
   */
  public self: GuildUser;
  //Unique Identifier for GuildUser => UserId + ServerId
  constructor(
    private userId: string,
    private serverId: string,
    alreadyFetched?: GuildUser
  ) {
    if (!userId) throw new Error('Invalid user provided');
    if (!serverId) throw new Error('No serverId provided');

    if (alreadyFetched) this.self = alreadyFetched;
  }

  async fetch(): Promise<SaranGuildUser> {
    try {
      const user = await prisma.guildUser.findUnique({
        where: {
          userId_serverId: { userId: this.userId, serverId: this.serverId },
        },
      });

      if (!user) await this.create();
      else this.self = user;
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  async update(update: Prisma.GuildUserUpdateInput): Promise<SaranGuildUser> {
    try {
      this.self = await prisma.guildUser.update({
        where: {
          userId_serverId: { userId: this.userId, serverId: this.serverId },
        },
        data: update,
      });
    } catch (err) {
      console.log(err);
      await this.create(); //Create guild user as
    }

    return this;
  }

  private async create(displayName?: string): Promise<void> {
    try {
      this.self = await prisma.guildUser.create({
        data: {
          userId: this.userId,
          serverId: this.serverId,
          displayName,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export async function getReactionBoardInfo(
  messageId: string,
  serverId: string
) {
  return await prisma.reactionBoardMessages.findUnique({
    where: { messageId_serverId: { messageId, serverId } },
  });
}

export async function updateReactionBoardInfo(
  messageId: string,
  serverId: string,
  reactionAmount: number
) {
  return await prisma.reactionBoardMessages.update({
    where: { messageId_serverId: { messageId, serverId } },
    data: { reactions: reactionAmount },
  });
}

export async function createReactionBoardInfo(
  amount: number,
  name: string,
  embedMessageId: string,
  message: Message
) {
  return await prisma.reactionBoardMessages.create({
    data: {
      messageId: message.id,
      serverId: message.guildId,
      reactions: amount,
      reactionName: name,
      userId: message.author.id,
      embedMessageId,
    },
  });
}

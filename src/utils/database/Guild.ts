import { GuildConfig, GuildUser, Prisma, PrismaClient } from '@prisma/client';
import { GuildMember, Message } from 'discord.js';
import { GuildMemberWithUser } from './User';

const prisma = new PrismaClient();

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
      this._config = await prisma.guildConfig.upsert({
        where: { id: this.serverId },
        create: { id: this.serverId },
        update: {},
      });
    } catch (err) {
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
      this.self = await prisma.guildUser.findUnique({
        where: {
          userId_serverId: { userId: this.userId, serverId: this.serverId },
        },
      });
    } catch (err) {
      console.log(err);
    }

    return this;
  }

  async update(update: Prisma.GuildUserUpdateInput): Promise<SaranGuildUser> {
    const user = await prisma.guildUser.update({
      where: {
        userId_serverId: { userId: this.userId, serverId: this.serverId },
      },
      data: update,
    });

    this.self = user;

    return this;
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

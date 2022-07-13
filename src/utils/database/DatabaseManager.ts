import {
  GuildConfig,
  GuildUser,
  Prisma,
  PrismaClient,
  User,
  UserTracks,
} from '@prisma/client';
import { GuildMember } from 'discord.js';
import { cacheMiddleware } from '../../cache';

const prisma = new PrismaClient();

prisma.$use(cacheMiddleware);

export class DatabaseManager {
  private prisma = new PrismaClient();
  users: UserRepository;
  guilds: GuildRepository;
  guildUsers: GuildUserRepository;
  tracks: TracksRepository;
  artists: ArtistRepository;
  albums: AlbumRepository;
  constructor() {
    prisma.$use(cacheMiddleware);
    this.users = new UserRepository(this.prisma.user);
    this.guilds = new GuildRepository(this.prisma.guildConfig);
    this.guildUsers = new GuildUserRepository(this.prisma.guildUser);
    this.tracks = new TracksRepository(this.prisma.userTracks);
    this.artists = new ArtistRepository(this.prisma.userArtists);
    this.albums = new AlbumRepository(this.prisma.userAlbums);
  }
}

export class UserRepository {
  constructor(readonly repo: PrismaClient['user']) {}

  async findById(id: string): Promise<User> {
    const user = await this.repo.findUnique({ where: { id } });
    if (!user) return await this.repo.create({ data: { id } });

    return user;
  }

  async updateById(id: string, data: Prisma.UserUpdateInput): Promise<void> {
    try {
      await this.repo.update({
        where: { id },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export class GuildRepository {
  constructor(readonly repo: PrismaClient['guildConfig']) {}

  async findById(id: string): Promise<GuildConfig> {
    const guild = await this.repo.findUnique({ where: { id } });
    if (!guild) return await this.repo.create({ data: { id } });
    return guild;
  }

  async updateById(
    id: string,
    data: Prisma.GuildConfigUpdateInput
  ): Promise<void> {
    try {
      await this.repo.update({
        where: { id },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  }
}
export class GuildUserRepository {
  constructor(readonly repo: PrismaClient['guildUser']) {}

  async findById(serverId: string, userId: string): Promise<GuildUser> {
    const guild = this.repo.findUnique({
      where: { userId_serverId: { serverId, userId } },
    });
    if (!guild) return await this.repo.create({ data: { serverId, userId } });
    return guild;
  }

  async updateById(
    serverId: string,
    userId: string,
    data: Prisma.GuildUserUpdateInput
  ): Promise<void> {
    const user = await this.repo.findUnique({
      where: { userId_serverId: { serverId, userId } },
    });

    try {
      //Not sure how to create with update data.
      if (!user) await this.repo.create({ data: { serverId, userId } });

      await this.repo.update({
        where: { userId_serverId: { serverId, userId } },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async findAllWithLastFm(serverId: string) {
    try {
      console.log('here');
      return await prisma.user.findMany({
        where: { lastFMName: { not: null }, guilds: { some: { serverId } } },
        include: { guilds: true },
      });
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async create(member: GuildMember): Promise<void> {
    const user = await this.repo.findUnique({
      where: {
        userId_serverId: { userId: member.id, serverId: member.guild.id },
      },
    });
    if (user) return;
    // member.premiumSinceTimestamp //Update to check if user is booster
    try {
      await this.repo.create({
        data: {
          userId: member.id,
          serverId: member.guild.id,
          displayName: member.displayName,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

export class TracksRepository {
  constructor(readonly repo: PrismaClient['userTracks']) {}
}

export class ArtistRepository {
  constructor(readonly repo: PrismaClient['userArtists']) {}
}

export class AlbumRepository {
  constructor(readonly repo: PrismaClient['userAlbums']) {}
}

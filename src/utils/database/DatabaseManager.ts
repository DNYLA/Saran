import {
  GuildConfig,
  GuildUser,
  Levels,
  Prisma,
  PrismaClient,
  User,
} from '@prisma/client';
import { client } from '../../main';

const prisma = new PrismaClient();

export class DatabaseManager {
  private prisma = new PrismaClient();
  users: UserRepository;
  guilds: GuildRepository;
  guildUsers: GuildUserRepository;
  tracks: TracksRepository;
  artists: ArtistRepository;
  albums: AlbumRepository;
  levels: LevelsRepository;
  constructor() {
    // this.prisma.$use(cacheMiddleware);
    this.users = new UserRepository(this.prisma.user);
    this.guilds = new GuildRepository(this.prisma.guildConfig);
    this.guildUsers = new GuildUserRepository(
      this.prisma.guildUser,
      this.prisma.user
    );
    this.tracks = new TracksRepository(this.prisma.userTracks);
    this.artists = new ArtistRepository(this.prisma.userArtists);
    this.albums = new AlbumRepository(this.prisma.userAlbums);
    this.levels = new LevelsRepository(this.prisma.levels);
  }
}

export class UserRepository {
  constructor(readonly repo: PrismaClient['user']) {}

  async findById(id: string): Promise<User> {
    try {
      const user = await this.repo.findUnique({ where: { id } });
      if (!user) return await this.repo.create({ data: { id } });

      return user;
    } catch (err) {
      return null;
    }
  }

  async findGuildUser(id: string, serverId: string) {
    const user = await this.repo.findUnique({
      where: { id },
      include: { guilds: { where: { serverId: serverId } } },
    });

    console.log('FindGuildUser');
    console.log(user);

    if (!user)
      return await this.repo.create({
        data: { id, guilds: { create: { serverId } } },
        include: { guilds: true },
      });

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

  async findByIdWithLevels(
    id: string
  ): Promise<GuildConfig & { levels: Levels[] }> {
    const guild = await this.repo.findUnique({
      where: { id },
      include: { levels: true },
    });
    if (!guild)
      return await this.repo.create({
        data: { id },
        include: { levels: true },
      });
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
  constructor(
    readonly repo: PrismaClient['guildUser'],
    private readonly userRepo: PrismaClient['user']
  ) {}

  async findById(serverId: string, userId: string): Promise<GuildUser> {
    const guild = await this.repo.findUnique({
      where: { userId_serverId: { serverId, userId } },
    });
    if (!guild) return await this.create(userId, serverId);

    return guild;
  }

  async updateById(
    serverId: string,
    userId: string,
    data: Prisma.GuildUserUpdateInput
  ): Promise<GuildUser> {
    try {
      const user = await this.repo.findUnique({
        where: { userId_serverId: { serverId, userId } },
      });

      //Not sure how to create with update data.
      if (!user) await this.create(userId, serverId);

      return await this.repo.update({
        where: { userId_serverId: { userId, serverId } },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async findAllWithLastFm(serverId: string) {
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

  async create(userId: string, serverId: string): Promise<GuildUser> {
    // member.premiumSinceTimestamp //Update to check if user is booster
    const guild = await client.guilds.fetch(serverId);
    const member = await guild.members.fetch(userId);

    try {
      const user = await this.userRepo.findUnique({
        where: { id: userId },
        include: { guilds: { where: { serverId } } },
      });
      console.log(user);
      if (user && user.guilds.length > 0) return user.guilds[0]; //returns guilduser
      if (!user) {
        const newUser = await this.userRepo.create({
          data: {
            id: userId,
            guilds: { create: { serverId, displayName: member.displayName } },
          },
          include: { guilds: true },
        });

        return newUser.guilds[0];
      }

      return await this.repo.create({
        data: { userId, serverId, displayName: member.displayName },
      });
    } catch (err) {
      console.log(err);
    }
  }
}

type WhoKnowsFilter = {
  where: {
    name: Prisma.StringFilter;
    artistName?: Prisma.StringFilter;
    user?: { guilds: { some: { serverId: string } } };
  };
  orderBy: { plays: Prisma.SortOrder };
  include: { user: boolean };
};

class LastFMRepository {
  /**
   *
   */
  // constructor() {}

  WhoKnowsFilter(name: string, artistName?: string, serverId?: string) {
    const filter: WhoKnowsFilter = {
      where: {
        name: { equals: name, mode: 'insensitive' },
      },
      orderBy: {
        plays: 'desc',
      },
      include: {
        user: true,
      },
    };

    if (serverId) {
      filter.where['user'] = { guilds: { some: { serverId } } };
    }

    if (artistName) {
      filter.where['artistName'] = { equals: artistName, mode: 'insensitive' };
    }

    return filter;
  }
}

export class TracksRepository extends LastFMRepository {
  constructor(readonly repo: PrismaClient['userTracks']) {
    super();
  }
}

export class ArtistRepository extends LastFMRepository {
  constructor(readonly repo: PrismaClient['userArtists']) {
    super();
  }
}

export class AlbumRepository extends LastFMRepository {
  constructor(readonly repo: PrismaClient['userAlbums']) {
    super();
  }
}

export class LevelsRepository {
  constructor(readonly repo: PrismaClient['levels']) {}
}

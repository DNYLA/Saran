import { GuildConfig, Prisma, PrismaClient, User } from '@prisma/client';
import { cacheMiddleware } from '../../cache';

const prisma = new PrismaClient();

prisma.$use(cacheMiddleware);

export class DatabaseManager {
  private prisma = new PrismaClient();
  users: UserRepository;
  guilds: GuildRepository;
  constructor() {
    prisma.$use(cacheMiddleware);
    this.users = new UserRepository(this.prisma.user);
    this.guilds = new GuildRepository(this.prisma.guildConfig);
  }
}

export class UserRepository {
  constructor(readonly repo: PrismaClient['user']) {}

  async findById(id: string): Promise<User> {
    const user = this.repo.findUnique({ where: { id } });
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
  constructor(private readonly repo: PrismaClient['guildConfig']) {}

  async findById(id: string): Promise<GuildConfig> {
    const guild = this.repo.findUnique({ where: { id } });
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

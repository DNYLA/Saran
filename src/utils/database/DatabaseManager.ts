import { Prisma, PrismaClient, User } from '@prisma/client';
import { UserManager } from 'discord.js';
import { cacheMiddleware } from '../../cache';
import { SaranGuild } from './Guild';
import { SaranUser } from './User';

const prisma = new PrismaClient();

prisma.$use(cacheMiddleware);

export class DatabaseManager {
  private _users = new Map<string, SaranUser>();
  private _guilds = new Map<string, SaranGuild>();

  constructor() {}

  async user(id: string) {
    const user = this._users.get(id);

    if (user) return user;

    const fetchedUser = await new SaranUser(id).fetch();
    this._users.set(id, fetchedUser);

    return fetchedUser;
  }

  async guild(id: string) {
    const guild = this._guilds.get(id);
    if (guild) return guild;

    const fetchedGuild = await new SaranGuild(id).fetch();
    this._guilds.set(id, fetchedGuild);

    return fetchedGuild;
  }

  /*
    Custom fetch to grab users (not SaranUsers) from the DB.
    Note: Should only be used when wanting to fetch partial users.
    which is why we dont want to cache or store in the map.
  */
  async users(args: Prisma.UserFindManyArgs): Promise<User[]> {
    try {
      return await prisma.user.findMany(args);
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

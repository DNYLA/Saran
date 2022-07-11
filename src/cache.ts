import { User } from '@prisma/client';
import Redis from 'ioredis';
import { resolve } from 'path';
import Prisma from 'prisma';
import { createPrismaRedisCache } from 'prisma-redis-middleware';

const users = new Map<string, User>();

export function isCached(id: string): User {
  return users.get(id);
}

export function setCache(user: User) {
  //Not sure what the bottleneck is right now but limiting to 200 seems reasonable will increase
  //as the bot scales.
  if (users.size > 200) users.clear();
  users.set(user.id, user);
}

export function deleteCache(id: string) {}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

export const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
  models: [{ model: 'User' }, { model: 'GuildConfig', cacheTime: 10 * 60 }],
  storage: {
    type: 'redis',
    options: {
      client: redis,
      invalidation: { referencesTTL: 300 },
    },
  },
  cacheTime: 300,
  // excludeModels: ['Product', 'Cart'],
  // excludeMethods: ['count', 'groupBy'],
  onHit: (key) => {
    console.log('hit', key);
    console.log('Foundf');
  },
  onMiss: (key) => {
    console.log('Missed the value');
    // console.log('miss', key);
  },
  onError: (key) => {
    console.log('Error below');
    // console.log('error', key);
  },
});

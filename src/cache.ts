import { User } from '@prisma/client';

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

// const redis = new Redis({
//   host: process.env.REDIS_HOST,
//   port: Number(process.env.REDIS_PORT),
//   password: process.env.REDIS_PASSWORD,
// });

// Disabled as its causing way too many issues right now.
// export const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
//   models: [{ model: 'User' }, { model: 'GuildConfig' }],
//   storage: {
//     type: 'redis',
//     options: {
//       client: redis,
//       invalidation: { referencesTTL: 15 * 60 },
//     },
//   },
//   cacheTime: 15 * 60,
//   excludeModels: ['ReactionBoardMessages'],
//   // excludeMethods: ['count', 'groupBy'],
//   // onHit: (key) => console.log(key),
// });

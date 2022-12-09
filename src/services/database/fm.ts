import { Prisma } from '@prisma/client';

type WhoKnowsFilter = {
  where: {
    name: Prisma.StringFilter;
    artistName?: Prisma.StringFilter;
    user?: { guilds: { some: { serverId: string } } };
  };
  orderBy: { plays: Prisma.SortOrder };
  include: { user: boolean };
};

//Generates WKFilter and returns it
export async function WhoKnowsFilter(
  name: string,
  artistName?: string,
  serverId?: string
) {
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

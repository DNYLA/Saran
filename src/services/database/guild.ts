import { GuildConfig, Levels, Prisma, User } from '@prisma/client';
import { prisma } from '../prisma';

export async function fetchGuild(
  id: string,
  showLevels?: boolean
): Promise<GuildConfig> {
  const guild = await prisma.guildConfig.findUnique({ where: { id } });
  if (!guild) return await prisma.guildConfig.create({ data: { id } });
  return guild;
}

export async function fetchGuildWithLevels(
  id: string
): Promise<GuildConfig & { levels: Levels[] }> {
  const guild = await prisma.guildConfig.findUnique({
    where: { id },
    include: { levels: true },
  });
  if (!guild)
    return await prisma.guildConfig.create({
      data: { id },
      include: { levels: true },
    });
  return guild;
}

export async function updateGuild(
  id: string,
  data: Prisma.GuildConfigUpdateInput
): Promise<void> {
  try {
    await prisma.guildConfig.update({
      where: { id },
      data,
    });
  } catch (err) {
    console.log(err);
  }
}

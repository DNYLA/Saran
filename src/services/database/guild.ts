import { GuildConfig, Levels, Prisma } from '@prisma/client';
import { Message } from 'discord.js';
import prisma from '../prisma';

export async function fetchGuild(id: string): Promise<GuildConfig> {
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

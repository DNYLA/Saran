/* eslint-disable deprecation/deprecation */
import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';

const prisma = new PrismaClient();

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

import { Prisma, User } from '@prisma/client';
import prisma from '../prisma';

export async function createUser(id: string): Promise<User> {
  try {
    return await prisma.user.create({ data: { id } });
  } catch (err) {
    console.log(err);
  }
}

export async function fetchDatabaseUser(id: string): Promise<User> {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return await createUser(id);

    return user;
  } catch (err) {
    console.log(err);
  }
}

export async function fetchGuildUser(id: string, serverId: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { guilds: { where: { serverId: serverId } } },
  });

  if (!user)
    return await prisma.user.create({
      data: { id, guilds: { create: { serverId } } },
      include: { guilds: true },
    });

  return user;
}

export async function updateUser(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<void> {
  try {
    await prisma.user.update({
      where: { id },
      data,
    });
  } catch (err) {
    console.log(err);
  }
}

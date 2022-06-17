import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUser = async (id: string) => {
  let user = await prisma.user.findUnique({ where: { id } });
  if (!user) user = await prisma.user.create({ data: { id } });

  return user;
};

export const updateUserById = async (id: string, update: any) => {
  try {
    await prisma.user.upsert({
      where: { id },
      update,
      create: { id, ...update },
    });
  } catch (err) {
    return false;
  }

  return true;
};

const setUser = (id: string) => {};

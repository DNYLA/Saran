import { Message } from 'discord.js';
import { getUser } from '../utils/database/User';

export default async (message: Message): Promise<boolean> => {
  const user = await getUser(message.author.id);

  return user.lastFMName !== null;
};

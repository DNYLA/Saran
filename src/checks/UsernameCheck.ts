import { Message } from 'discord.js';
import { fetchDatabaseUser } from '../services/database/user';
import { getTargetUserId } from '../utils/fmHelpers';

export default async (message: Message, args: string[]): Promise<boolean> => {
  const userId = getTargetUserId(message, args);
  const user = await fetchDatabaseUser(userId);
  return user.lastFMName !== null;
};

export const UsernameCheckNoMentions = async (
  message: Message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  args: string[]
): Promise<boolean> => {
  const user = await fetchDatabaseUser(message.author.id);

  return user.lastFMName !== null;
};

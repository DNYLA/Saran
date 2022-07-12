import { Message } from 'discord.js';
import DiscordClient from '../utils/client';
import { getTargetUserId } from '../utils/fmHelpers';

export default async (message: Message, args: string[]): Promise<boolean> => {
  const userId = getTargetUserId(message, args);
  const client = message.client as DiscordClient;
  const user = await client.database.users.findById(userId);
  return user.lastFMName !== null;
};

export const UsernameCheckNoMentions = async (
  message: Message,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  args: string[]
): Promise<boolean> => {
  const user = await (message.client as DiscordClient).database.users.findById(
    message.author.id
  );

  return user.lastFMName !== null;
};

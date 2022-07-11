import { Message, MessageMentions } from 'discord.js';
import DiscordClient from '../utils/client';
import { SaranUser } from '../utils/database/User';
import { getTargetUserId } from '../utils/fmHelpers';
import { getDiscordUserFromMention } from '../utils/Helpers/Moderation';

export default async (message: Message, args: string[]): Promise<boolean> => {
  const userId = getTargetUserId(message, args);
  const client = message.client as DiscordClient;
  const user = await client.database.user(userId);
  return user.info.lastFMName !== null;
};

export const UsernameCheckNoMentions = async (
  message: Message,
  args: string[]
): Promise<boolean> => {
  const user = await (message.client as DiscordClient).database.user(
    message.author.id
  );

  return user.info.lastFMName !== null;
};

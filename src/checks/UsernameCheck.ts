import { Message, MessageMentions } from 'discord.js';
import DiscordClient from '../utils/client';
import { getUser } from '../utils/database/User';
import { getTargetUserId } from '../utils/fmHelpers';
import { getDiscordUserFromMention } from '../utils/Helpers/Moderation';

export default async (message: Message, args: string[]): Promise<boolean> => {
  const userId = getTargetUserId(message, args);
  const user = await getUser(userId);

  return user.lastFMName !== null;
};

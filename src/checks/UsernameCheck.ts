import { Message, MessageMentions } from 'discord.js';
import DiscordClient from '../utils/client';
import { SaranUser } from '../utils/database/User';
import { getTargetUserId } from '../utils/fmHelpers';
import { getDiscordUserFromMention } from '../utils/Helpers/Moderation';

export default async (message: Message, args: string[]): Promise<boolean> => {
  const userId = getTargetUserId(message, args);
  const user = await new SaranUser(userId).fetch();

  return user.info.lastFMName !== null;
};

export const UsernameCheckNoMentions = async (
  message: Message,
  args: string[]
): Promise<boolean> => {
  const user = await new SaranUser(message.author.id).fetch();

  return user.info.lastFMName !== null;
};

import { Message, MessageMentions } from 'discord.js';
import { ArgumentType } from './types';

export const MentionUserId = (
  message: Message,
  args: string[],
  index: number
) => {
  if (args.length > 0) {
    const isMention = args[index]
      .matchAll(MessageMentions.USERS_PATTERN)
      .next().value;
    if (isMention) {
      return isMention[1];
    }
  }

  return null;
};

//Converts mention into ID or returns string if doesnt exist.
export const MentionIdOrArg = (
  message: Message,
  args: string[],
  index: number
) => {
  if (args.length > 0) {
    const isMention = args[index]
      .matchAll(MessageMentions.USERS_PATTERN)
      .next().value;
    if (isMention) {
      return isMention[1];
    }
  }

  return args[index];
};

export const SelfUserId = (message: Message) => {
  return message.author.id;
};

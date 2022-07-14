import { Message, MessageMentions } from 'discord.js';

export const StringToColour = (message: Message, args: string[]) => {
  if (args.length > 0) return args[0].toUpperCase();
  else return null;
};

export const ImageUrlOrAttachment = (message: Message, args: string[]) => {
  if (message.attachments.size > 0) {
    return message.attachments.first().url;
  }

  if (args.length > 0) return args[0];

  return null;
};

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

export const ChannelMentionIdOrArg = (
  message: Message,
  args: string[],
  index: number
) => {
  if (args.length > 0) {
    const isMention = args[index]
      .matchAll(MessageMentions.CHANNELS_PATTERN)
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

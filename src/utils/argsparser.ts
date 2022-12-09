import { Message, MessageMentions } from 'discord.js';

export const StringToColour = async (message: Message, args: string[]) => {
  if (args.length > 0) return args[0].toUpperCase();
  else return null;
};

export const ImageUrlOrAttachment = async (
  message: Message,
  args: string[]
) => {
  if (message.attachments.size > 0) {
    return message.attachments.first().url;
  }

  if (args.length > 0) return args[0];

  return null;
};

export const MentionUserId = async (
  message: Message,
  args: string[],
  index: number
) => {
  const client = message.client;

  if (args.length > 0) {
    const UserPattern = new RegExp(MessageMentions.UsersPattern, 'g');
    const isMention = args[index].matchAll(UserPattern).next().value;
    if (isMention) {
      return isMention[1];
    } else {
      try {
        const user = await client.users.fetch(args[index]);
        if (user) return user.id;
        else return null;
      } catch (err) {
        return null;
      }
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
    const UserPattern = new RegExp(MessageMentions.UsersPattern, 'g');
    const isMention = args[index].matchAll(UserPattern).next().value;
    if (isMention) {
      return isMention[1];
    }
  }

  return args[index];
};

export const ChannelMentionIdOrArg = async (
  message: Message,
  args: string[],
  index: number
) => {
  if (args.length > 0) {
    const ChannelPattern = new RegExp(MessageMentions.ChannelsPattern, 'g');
    const isMention = args[index].matchAll(ChannelPattern).next().value;
    if (isMention) {
      return isMention[1];
    }
  }

  return args[index];
};

export const RoleMentionIdOrArg = (
  message: Message,
  args: string[],
  index: number
) => {
  if (args.length > 0) {
    const RolePattern = new RegExp(MessageMentions.RolesPattern, 'g');
    const isMention = args[index].matchAll(RolePattern).next().value;
    if (isMention) {
      return isMention[1];
    }
  }

  return args[index];
};

// export const NumberParser = (
//   message: Message,
//   args: string[],
//   index: number
// ) => {};

export const SelfUserId = (message: Message) => {
  return message.author.id;
};

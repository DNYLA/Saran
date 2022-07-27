import { GuildMember, Message, User, MessageMentions, Guild } from 'discord.js';
import DiscordClient from '../client';

//This is added incase i decide to improve how permissions are handled.
export function hasAdminPermissions(message: Message) {
  const isOwner = message.guild.ownerId === message.member.id;
  if (message.member.permissions.has('Administrator') || isOwner) {
    return true;
  }

  return false;
}

export function getUserIdFromMessage(message: Message, argument: string) {
  const mention = message.mentions.users.first();

  if (mention) return mention.id;
  else return argument;
}

export async function getUserFromMessage(
  client: DiscordClient,
  message: Message
) {
  try {
    return await client.users.fetch(message.author.id);
  } catch (err) {
    message.reply('Unable to fetch user!');
  }
}

export async function GetUserFromMessage(
  client: DiscordClient,
  message: Message,
  args: string[]
) {
  if (!hasAdminPermissions(message)) return;

  if (args.length === 0) {
    message.reply('Provide an ID or Mention');
    return null;
  }

  let user: User;
  const userId = getUserIdFromMessage(message, args[0]);

  try {
    user = await client.users.fetch(userId);
  } catch (err) {
    message.reply('Unable to fetch user!');
  }

  return user;
}

export async function GetGuildUserFromMessage(
  message: Message,
  args: string[]
) {
  if (!hasAdminPermissions(message)) return;
  if (args.length === 0) {
    message.reply('Provide an ID or Mention');
    return null;
  }

  let user: GuildMember;
  const userId = getUserIdFromMessage(message, args[0]);

  try {
    user = await message.guild.members.fetch(userId);
    if (!user) {
      message.reply('user not in guild');
      return null;
    }
  } catch (err) {
    message.reply('User not in guild!');
    return null;
  }

  return user;
}

export async function getDiscordUserFromMention(
  client: DiscordClient,
  mention: string,
  forceCheck?: boolean
) {
  const UsersPattern = new RegExp(MessageMentions.UsersPattern, 'g');
  const matches = mention.matchAll(UsersPattern).next().value;

  if (!matches && forceCheck === true)
    try {
      return await client.users.fetch(mention);
    } catch (err) {
      return null;
    }
  else if (!matches) return null;
  //return client.users.fetch(mention);
  return await client.users.fetch(matches[1]);
}

export async function getUserFromId(client: DiscordClient, mention: string) {
  const UsersPattern = new RegExp(MessageMentions.UsersPattern, 'g');

  const matches = mention.matchAll(UsersPattern).next().value;

  if (!matches) return;
}

export async function getGuildMemberFromMention(
  guild: Guild,
  mention: string
): Promise<GuildMember> {
  const UsersPattern = new RegExp(MessageMentions.UsersPattern, 'g');
  const matches = mention.matchAll(UsersPattern).next().value;

  if (!matches)
    try {
      return await guild.members.fetch(mention);
    } catch (err) {
      return null;
    }
  // return await guild.members.fetch(mention).catch();

  return await guild.members.fetch(matches[1]);
}

import { GuildMember, Message, User } from 'discord.js';
import DiscordClient from '../client';

//This is added incase i decide to improve how permissions are handled.
export function hasAdminPermissions(message: Message) {
  const isOwner = message.guild.ownerId === message.member.id;
  if (message.member.permissions.has('ADMINISTRATOR') || isOwner) {
    return true;
  }

  return false;
}

export function getUserIdFromMessage(message: Message, argument: string) {
  let mention = message.mentions.users.first();

  if (mention) return mention.id;
  else return argument;
}

export async function getUserFromMessage(
  client: DiscordClient,
  message: Message,
  args: string[]
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

import { MessageMentions } from 'discord.js';
import { Periods } from '../api/lastfm';
import { SaranUser } from './database/User';

export function getArgsFromMsg(
  msg: string,
  prefixLn: number
): { commandName: string; args?: string[] } {
  // Args including the command name
  const args = msg.slice(prefixLn).split(/ +/);
  console.log(args);
  if (args[0] === 'lf' && args.length >= 2) {
    console.log('Here');
    return {
      commandName: `${args[0]} ${args[1]}`,
      args: args.slice(2),
    };
  } else {
    return {
      commandName: args[0],
      args: args.slice(1),
    };
  }
}

export enum MessageType {
  Channel = '#',
  Mention = '@',
}

export function getIdFromTag(msg: string, messageType: MessageType) {
  console.log(messageType);
  console.log(msg);
  if (msg.includes(messageType)) {
    const index = msg.indexOf(messageType);
    console.log(index);
  }
}

export function mentionUser(userId: string): string {
  return `<@${userId}>`;
}

export function joinArgs(args: string[]) {
  if (args.length > 0) {
    const joined = args.join(' ');

    return joined.split(' | ');
  }

  return [];
}

export async function getUserFromMention(mention: string) {
  const userId = getIdFromMention(mention);
  if (!userId) return null;
  return await new SaranUser(userId).fetch();
}

export function getIdFromMention(mention: string) {
  const isMention = mention
    .matchAll(MessageMentions.USERS_PATTERN)
    .next().value;
  if (isMention) return isMention[1];
  else return null;
}

export function convertPeriodToText(period: Periods) {
  switch (period) {
    case Periods.overall:
      return 'overall';
    case Periods['7d']:
      return 'weekly';
    case Periods['1w']:
      return 'weekly';
    case Periods['30d']:
      return 'monthly';
    case Periods['1m']:
      return 'monthly';
    case Periods['6m']:
      return 'bi-yearly';
    case Periods['12m']:
      return 'yearly';
    case Periods['1y']:
      return 'yearly';
    default:
      return 'overall';
  }
}

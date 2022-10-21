import { EmbedBuilder, Message, MessageMentions } from 'discord.js';
import { Periods } from '../api/lastfm';

export function getArgsFromMsg(
  msg: string,
  prefixLn: number
): { commandName: string; args?: string[] } {
  // Args including the command name
  const args = msg.slice(prefixLn).split(/ +/);
  // if ((args[0] === 'lf' || args[0] === 'levels') && args.length >= 2) {
  //   console.log('Here');
  //   return {
  //     commandName: `${args[0]} ${args[1]}`,
  //     args: args.slice(2),
  //   };
  // } else {
  return {
    commandName: args[0],
    args: args.slice(1),
  };
  // }
}

export enum MessageType {
  Channel = '#',
  Mention = '@',
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

export function getIdFromMention(mention: string) {
  const UsersPattern = new RegExp(MessageMentions.UsersPattern, 'g');
  const isMention = mention.matchAll(UsersPattern).next().value;
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

export async function UnderMaintance(message: Message) {
  if (!message.content.startsWith(',')) return;
  const maintanceEmbed = new EmbedBuilder()
    .setColor('#49b166')
    .setDescription(
      `<@${message.author.id}> Saran is currently under maintance! **ETA: 60minutes.**`
    );
  await message.channel.send({ embeds: [maintanceEmbed] });

  return;
}

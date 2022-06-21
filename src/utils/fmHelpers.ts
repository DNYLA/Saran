import { User } from '@prisma/client';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Periods } from '../api/lastfm';
import { getUser } from './database/User';
import { convertPeriodToText, mentionUser } from './helpers';

//Returns either the author id or if a mention exists the mentioned users id
export async function getUserFromMessage(msg: Message) {
  let userId = msg.author.id;

  const mention = msg.mentions.users.first();

  if (mention) {
    userId = mention.id;
  }

  return await getUser(userId);
}

export function getPeriodFromArg(args: string[]): Periods {
  let period: Periods = Periods['overall'];

  if (args.length > 0) {
    const validPeriod = Periods[args[0]];
    if (validPeriod) period = validPeriod;
  }

  return period;
}

export function hasUsernameSet(message: Message, user: User): boolean {
  if (!user.lastFMName) {
    const usernameNotSetEmbed = new MessageEmbed()
      .setColor('#cb0f0f')
      .setDescription(
        `${mentionUser(
          user.id
        )} Set your lastFM username by doing ,lf set <username>`
      );
    message.reply({ embeds: [usernameNotSetEmbed] });
    return false;
  }

  return true;
}

export type TopListStats = {
  name: string;
  url: string;
  playcount: string;
};

export function convertTopStatsToEmbed(
  user: User,
  list: TopListStats[],
  period: Periods,
  text: string
) {
  let description = '';
  const embedTitle = `${user.lastFMName} ${convertPeriodToText(
    period
  )} top ${text}`;

  list.forEach((data, i) => {
    try {
      description += `**${i + 1}. [${data.name}](${data.url})** (${
        data.playcount
      })\n`;
    } catch (err) {
      console.log(err);
    }
  });

  try {
    const messageEmbed = new MessageEmbed()
      .setColor('#4a5656')
      .setAuthor({
        name: user.lastFMName,
        url: `https://www.last.fm/user/${user.lastFMName}`,
        iconURL:
          'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
      })
      .setTitle(embedTitle)
      .setDescription(description);

    return messageEmbed;
  } catch (err) {
    return null;
  }
}

//Will update embed to look better in the future
export function sendNoDataEmbed(message: Message) {
  const embed = new MessageEmbed().setTitle('No Data Availble!');
  return message.channel.send({ embeds: [embed] });
}

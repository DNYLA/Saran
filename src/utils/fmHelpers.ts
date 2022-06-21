import { User } from '@prisma/client';
import { Channel, Message, MessageEmbed, TextChannel } from 'discord.js';
import {
  fetchRecentTracks,
  fetchSearchTrack,
  fetchTopArtists,
  fetchTopTenAlbums,
  fetchTopTenTracks,
  fetchTrackInfo,
  Periods,
} from '../api/lastfm';
import { getUser } from './database/User';
import { convertPeriodToText, mentionUser } from './helpers';
import { ArtistInfo, PartialUser, RecentTrack, Track } from './types';

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

export enum TopTenType {
  Track,
  Artist,
  Album,
}

export async function getTopTenStats(
  message: Message,
  args: string[],
  type: TopTenType
) {
  message.channel.sendTyping();
  const user = await getUserFromMessage(message);
  if (user.id !== message.author.id) args.shift();
  if (!hasUsernameSet(message, user)) return;

  const period: Periods = getPeriodFromArg(args);
  let topStats: ArtistInfo[];

  try {
    if (type === TopTenType.Track) {
      const { data: res } = await fetchTopTenTracks(user.lastFMName, period);
      topStats = res.toptracks.track;
    } else if (type === TopTenType.Artist) {
      const { data: res } = await fetchTopArtists(user.lastFMName, period);
      topStats = res.topartists.artist;
    } else if (type === TopTenType.Album) {
      const { data: res } = await fetchTopTenAlbums(user.lastFMName, period);
      topStats = res.topalbums.album;
    }
  } catch (err) {
    console.log(err);
    return message.channel.send('Unable to process request');
  }

  if (topStats.length === 0) return sendNoDataEmbed(message);

  const embed = convertTopStatsToEmbed(user, topStats, period, 'artists');

  if (embed) message.channel.send({ embeds: [embed] });
  else message.reply('Unable to display top tracks!');
}

export async function fetchRecentTrackInfo(username: string): Promise<{
  track: Track;
  recentTrack: RecentTrack;
  user: PartialUser;
}> {
  let recentTrack: RecentTrack;
  let userInfo: PartialUser;

  try {
    const { data: res } = await fetchRecentTracks(username, 1);
    if (res.recenttracks.length == 0) return null;

    recentTrack = res.recenttracks.track[0];
    userInfo = res.recenttracks['@attr'];

    console.log(recentTrack);

    const { data } = await fetchTrackInfo(
      username,
      recentTrack.name,
      recentTrack.artist['#text']
    );

    return { track: data.track, recentTrack: recentTrack, user: userInfo };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchTrackInfo(
  username: string,
  name: string,
  artist?: string
): Promise<Track> {
  try {
    const { data: res } = await fetchSearchTrack(username, name, artist);
    if (res.results.trackmatches.track.length == 0) return null;

    // console.log(data);
    const trackSearch: any = res.results.trackmatches.track;
    const { data } = await fetchTrackInfo(
      username,
      trackSearch[0].name,
      trackSearch[0].artist
    );
    // console.log(data);
    return data.track;
  } catch (err) {
    console.log(err);
    return null;
  }
}

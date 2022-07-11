import { User } from '@prisma/client';
import axios from 'axios';
import {
  Channel,
  Message,
  MessageAttachment,
  MessageEmbed,
  MessageMentions,
  TextChannel,
} from 'discord.js';
import {
  fetchAlbumInfo,
  fetchArtistInfo,
  fetchRecentTracks,
  fetchSearchAlbum,
  fetchSearchArtist,
  fetchSearchTrack,
  fetchTopArtists,
  fetchTopTenAlbums,
  fetchTopTenTracks,
  fetchTrackInfo,
  Periods,
} from '../api/lastfm';
import { TopTenArguments } from '../commands/FM/TopTen/topartists';
import { setCachedPlays } from './database/redisManager';
import { SaranUser } from './database/User';
import { convertPeriodToText, mentionUser } from './helpers';
import {
  Album,
  Artist,
  ArtistInfo,
  PartialUser,
  RecentTrack,
  TopAlbum,
  TopArtist,
  TopTrack,
  Track,
} from './types';
const fs = require('fs');

//Returns either the author id or if a mention exists the mentioned users id
export async function getUserFromMessage(
  msg: Message,
  ignoreMention?: boolean
) {
  let userId = msg.author.id;

  const mention = msg.mentions.users.first();

  if (mention && !ignoreMention) {
    userId = mention.id;
  }

  return await new SaranUser(userId).fetch();
}

export function getPeriodFromString(arg: string): Periods {
  let period: Periods = Periods['overall'];

  const validPeriod = Periods[arg.toLowerCase()];
  if (validPeriod) period = validPeriod;

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

export async function cacheTopTenStats(
  username: string,
  stats: TopTrack[] | TopArtist[] | TopAlbum[],
  type: SearchType
) {
  if (type === SearchType.Artist) {
    return stats.forEach(async (stat: TopArtist) => {
      await setCachedPlays(username, stat.name, stat.playcount, type);
    });
  }

  return stats.forEach(async (stat: TopTrack | TopAlbum) => {
    await setCachedPlays(
      username,
      `${stat.name}-${stat.artist.name}`,
      stat.playcount,
      type
    );
  });
}

export function convertTopStatsToEmbed(
  user: User,
  list: TopTrack[] | TopArtist[] | TopAlbum[],
  period: Periods,
  text: string
) {
  let description = '';
  const embedTitle = `${user.lastFMName} ${convertPeriodToText(
    period
  )} top ${text}`;

  list.forEach((item, i) => {
    try {
      description += `**${i + 1}. [${item.name}](${item.url})** (${
        item.playcount
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

export enum SearchType {
  Track = 'Track',
  Artist = 'Artist',
  Album = 'Album',
}

export async function getTopTenStats(
  message: Message,
  args: TopTenArguments,
  type: SearchType
) {
  const user = (await new SaranUser(args.targetUserId).fetch()).info;

  console.log(args.period);
  const period: Periods = getPeriodFromString(args.period);
  let topStats: TopTrack[] | TopArtist[] | TopAlbum[];

  try {
    if (type === SearchType.Track) {
      topStats = await fetchTopTenTracks(user.lastFMName, period);
    } else if (type === SearchType.Artist) {
      topStats = await fetchTopArtists(user.lastFMName, period);
    } else if (type === SearchType.Album) {
      topStats = await fetchTopTenAlbums(user.lastFMName, period);
    }
  } catch (err) {
    console.log(err);
    return message.channel.send('Unable to process request');
  }

  if (topStats.length === 0) return sendNoDataEmbed(message);
  if (period === Periods.overall)
    await cacheTopTenStats(user.lastFMName, topStats, type);

  const embed = convertTopStatsToEmbed(
    user,
    topStats,
    period,
    type.toString() + `s`
  );

  if (embed) message.channel.send({ embeds: [embed] });
  else message.reply('Unable to display top tracks!');
}

export async function getTopTenStatsNoEmbed(
  message: Message,
  user: User,
  period: Periods,
  type: SearchType
) {
  let topStats: TopTrack[] | TopArtist[] | TopAlbum[];

  try {
    if (type === SearchType.Track) {
      topStats = await fetchTopTenTracks(user.lastFMName, period);
    } else if (type === SearchType.Artist) {
      topStats = await fetchTopArtists(user.lastFMName, period);
    } else if (type === SearchType.Album) {
      topStats = await fetchTopTenAlbums(user.lastFMName, period);
    }
  } catch (err) {
    console.log(err);
    message.channel.send('Unable to process request');
    return [];
  }

  if (topStats.length === 0) {
    sendNoDataEmbed(message);
    return [];
  }
  if (period === Periods.overall)
    await cacheTopTenStats(user.lastFMName, topStats, type);

  return topStats;
}

export async function fetchRecentTrackInfo(
  username: string
): Promise<{ track: Track; recentTrack: RecentTrack; user: PartialUser }> {
  try {
    const { tracks, user } = await fetchRecentTracks(username, 1);
    if (tracks.length === 0) return null;

    const recentTrack = tracks[0];
    const track = await fetchTrackInfo(
      username,
      recentTrack.name,
      recentTrack.artist['#text']
    );

    return { track, recentTrack: recentTrack, user: user };
  } catch (err) {
    console.log(err);
    return { track: null, recentTrack: null, user: null };
  }
}

export async function fetchSearchTrackInfo(
  username: string,
  name: string,
  artist?: string
): Promise<Track> {
  try {
    const trackSearch = await fetchSearchTrack(username, name, artist);
    if (!trackSearch) return null;

    return await fetchTrackInfo(username, trackSearch.name, trackSearch.artist);
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchRecentAlbumInfo(username: string): Promise<{
  album: Album;
  recentTrack: RecentTrack;
  user: PartialUser;
}> {
  try {
    const { tracks, user } = await fetchRecentTracks(username, 1);
    if (!tracks || tracks.length === 0) return null;

    const albumInfo = await fetchAlbumInfo(
      username,
      tracks[0].album['#text'],
      tracks[0].artist['#text']
    );

    return { album: albumInfo, recentTrack: tracks[0], user };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchAlbumInfo(
  username: string,
  name: string
): Promise<Album> {
  try {
    const albumSearch = await fetchSearchAlbum(name);
    if (!albumSearch) return null;

    return await fetchAlbumInfo(username, albumSearch.name, albumSearch.artist);
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchRecentArtistInfo(username: string): Promise<{
  artist: Artist;
  recentTrack: RecentTrack;
  user: PartialUser;
}> {
  try {
    const { tracks, user } = await fetchRecentTracks(username, 1);
    if (!tracks || tracks.length === 0) return null;

    const artistInfo = await fetchArtistInfo(
      username,
      tracks[0].artist['#text']
    );

    return { artist: artistInfo, recentTrack: tracks[0], user: user };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchSearchArtistInfo(
  username: string,
  name: string
): Promise<Artist> {
  try {
    const artistSearch = await fetchSearchArtist(name);
    if (!artistSearch) return null;
    return await fetchArtistInfo(username, artistSearch.name);
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function getTargetUserId(
  message: Message,
  args: string[],
  shiftArgs?: boolean
) {
  let userId = message.author.id;

  if (args.length > 0) {
    const isMention = args[0]
      .matchAll(MessageMentions.USERS_PATTERN)
      .next().value;
    if (isMention) {
      userId = isMention[1];
      if (shiftArgs) args.shift();
    }
  }

  return userId;
}

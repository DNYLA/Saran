import { User } from '@prisma/client';
import { Message } from 'discord.js';
import { fetchAlbumInfo, fetchArtistInfo } from '../../api/lastfm';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { fetchDatabaseUser } from '../../services/database/user';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { CONSTANTS } from '../../utils/constants';
import { setCachedPlays } from '../../utils/database/redisManager';
import {
  buildEmbed,
  isValidEmbed,
  EmbedBuilderData,
} from '../../utils/embedbuilder';
import { fetchRecentTrackInfo, SearchType } from '../../utils/fmHelpers';
import {
  Album,
  Artist,
  PartialUser,
  RecentTrack,
  Track,
} from '../../utils/types';

export default class NowPlaying extends Command {
  constructor() {
    super('np', {
      aliases: ['fm'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
      ],
    });
  }

  async run(message: Message, args: { targetUserId: string }) {
    // const user = await getUser(args.targetUserId);
    const user = await fetchDatabaseUser(args.targetUserId);
    const username = user.lastFMName;

    let track: Track;
    let recentTrack: RecentTrack;
    let userInfo: PartialUser;

    try {
      const {
        track: tr,
        recentTrack: rt,
        user: UserInfo,
      } = await fetchRecentTrackInfo(user.lastFMName);
      track = tr;
      recentTrack = rt;
      userInfo = UserInfo;
    } catch (err) {
      console.log(err);
      message.reply('Cant scrobble view this track');
    }

    if (!track && !recentTrack)
      return message.reply('Unable to display this track!');

    const baseUrl = 'https://www.last.fm/';
    const trackName = recentTrack.name;
    const artistName = track?.artist
      ? track.artist.name
      : recentTrack.artist['#text'];
    const artistUrl = track?.artist ? track.artist.url : baseUrl;
    const albumName = track?.album?.title ?? recentTrack.album['#text'];
    await setCachedPlays(
      user.lastFMName,
      `${trackName}-${artistName}`,
      track?.userplaycount ?? 0,
      SearchType.Track
    );

    let description = '';
    let globalTrackplays = '0';

    const mode = user.lastFMMode ? user.lastFMMode.toLowerCase() : null;
    let embed: EmbedBuilderData | string;

    if (!user.donator || mode === 'normal')
      embed = {
        color: '#0a090b',
        author: {
          name: user.lastFMName,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            user.lastFMImage ??
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        },
        thumbnail: recentTrack.image[3]['#text'],
        fields: [
          {
            name: 'Track',
            value: `[${trackName}](${recentTrack.url})`,
            inline: true,
          },
          {
            name: 'Artist',
            value: `[${artistName}](${artistUrl})`,
            inline: true,
          },
        ],
        footer: {
          text: `Playcount: ${track?.userplaycount ?? 0}  ∙ Album: ${
            recentTrack.album['#text']
          }`,
        },
      };
    else if (user.donator && (!mode || mode === 'donator')) {
      //Custom Mode
      const albumInfo = await fetchAlbumInfo(username, albumName, artistName);
      const artistInfo = await fetchArtistInfo(username, artistName);
      const trackPlays = track?.userplaycount ?? 0;
      const albumPlays = albumInfo?.userplaycount ?? 0;
      const artistPlays = artistInfo?.stats?.userplaycount ?? 0;
      const formatter = Intl.NumberFormat('en-uk');
      globalTrackplays = formatter.format(track?.playcount ?? 0);
      description = `>>> **${trackName}** ${'`x' + trackPlays + '`'}
    by **${artistName}** ${'`x' + artistPlays + '`'}
    on **${albumName}** ${'`x' + albumPlays + '`'}`;
      embed = {
        color: '#0a090b',
        author: {
          name: user.lastFMName,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        },
        description,
        thumbnail: recentTrack.image[3]['#text'],
        footer: {
          text: `Total Scrobbles: ${
            userInfo?.total ?? 0
          }  ∙ Global Plays: ${globalTrackplays}`,
        },
      };
    } else {
      //Custom Mode
      const albumInfo = await fetchAlbumInfo(username, albumName, artistName);
      const artistInfo = await fetchArtistInfo(username, artistName);

      embed = parseLastFM(
        mode,
        user,
        userInfo,
        track,
        albumInfo,
        artistInfo,
        {
          name: trackName,
          artist: artistName,
          artistUrl,
          album: albumName,
        },
        message.author.username,
        {
          track: recentTrack.image[3]['#text'],
          album: albumInfo.image[3]['#text'],
        }
      );
    }

    try {
      const EmbedBuilder = buildEmbed(embed);

      const npMessage = await message.channel.send({
        embeds: [EmbedBuilder],
      });
      npMessage.react('987085166285553715');
      npMessage.react('987085556733321247');
    } catch (err) {
      message.reply('Unable to display track! Try playing another one');
      console.log(err);
    }
  }
}

type VariableTypes = {
  username: string;
  fm_username: string;
  fm_avatar: string;
  fm_link: string;
  track_name: string;
  track_plays: string;
  track_image: string;
  track_cover: string;
  artist_name: string;
  artist_plays: string;
  album_name: string;
  album_plays: string;
  album_cover: string;
  total_scrobbles: string;
  global_scrobbles: string;
};

const parseLastFM = (
  data: string,
  user: User,
  fmuser: PartialUser,
  track: Track,
  album: Album,
  artist: Artist,
  currentTrack: {
    name: string;
    artist: string;
    artistUrl: string;
    album: string;
  },
  username: string,
  cover: { track: string; album?: string }
): EmbedBuilderData => {
  const formatter = Intl.NumberFormat('en-uk');
  const trackPlays = track?.userplaycount ?? 0;
  const albumPlays = album?.userplaycount ?? 0;
  const artistPlays = artist?.stats?.userplaycount ?? 0;
  const totalScrobbles = fmuser?.total ?? 0;
  const globalTrackplays = formatter.format(track?.playcount ?? 0);

  const json: VariableTypes = {
    username,
    fm_username: user.lastFMName,
    fm_avatar:
      user.lastFMImage ??
      'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
    fm_link: `https://www.last.fm/user/${user.lastFMName}`,
    track_name: currentTrack.name,
    track_plays: trackPlays.toString(),
    track_image: cover.track,
    track_cover: cover.track,
    artist_name: currentTrack.artist,
    artist_plays: artistPlays.toString(),
    album_name: currentTrack.album,
    album_plays: albumPlays.toString(),
    album_cover: cover.album ?? cover.track,
    total_scrobbles: totalScrobbles.toString(),
    global_scrobbles: globalTrackplays,
  };

  let parsed = data;

  for (const key of Object.keys(json)) {
    // parsed = parsed.replace('{' + key + '}', json[key as keyof VariableTypes]);

    const re = new RegExp(`{${key}}`, 'g');
    parsed = parsed.replace(re, json[key as keyof VariableTypes]);
  }

  parsed = parsed.replace('iconurl', 'iconURL');

  if (!isValidEmbed(parsed)) {
    return {
      color: CONSTANTS.COLORS.ERROR,
      description: `<@${user.id}>: **Invalid embed data. Use ,lf mode to reset your embed.**`,
    };
  }

  const embed: EmbedBuilderData = JSON.parse(parsed);
  return {
    author: embed.author,
    color: embed.color ?? CONSTANTS.COLORS.INFO,
    description: embed.description,
    fields: embed.fields,
    footer: embed.footer,
    image: embed.image,
    thumbnail: embed.thumbnail,
    timestamp: embed.timestamp,
    title: embed.title,
    url: embed.url,
  };
};

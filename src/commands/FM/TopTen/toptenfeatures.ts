import { Message } from 'discord.js';
import { resourceLimits } from 'worker_threads';
import { Periods } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../../utils/argsparser';
import { ArgumentTypes } from '../../../utils/base/command';
import DiscordClient from '../../../utils/client';
import {
  convertTopStatsToEmbed,
  fetchRecentArtistInfo,
  fetchSearchArtistInfo,
  getTopTenStats,
  SearchType,
  sendNoDataEmbed,
  TopList,
} from '../../../utils/fmHelpers';
import { Artist } from '../../../utils/types';
import LastFMCommand from '../LastFM';
import { TopTenArguments } from './topartists';

export default class TopTracks extends LastFMCommand {
  constructor() {
    super('topartistfeatures', {
      aliases: ['tarf'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage: 'Usage: ,lf tarf <period>(Optional)',
      arguments: [
        {
          parse: MentionUserId,
          default: SelfUserId,
          name: 'targetUserId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'artistName',
          type: ArgumentTypes.FULL_SENTANCE,
          optional: true,
        },
      ],
    });
  }

  async run(
    message: Message,
    args: { targetUserId: string; artistName: string }
  ) {
    const client = message.client as DiscordClient;
    const user = await (message.client as DiscordClient).db.users.findById(
      args.targetUserId
    );

    let artist: Artist;

    if (!args.artistName) {
      const artistInfo = await fetchRecentArtistInfo(user.lastFMName);
      artist = artistInfo.artist;
    } else {
      artist = await fetchSearchArtistInfo(user.lastFMName, args.artistName);
    }

    if (!artist) return message.reply('No artist found!');
    const trackService = client.db.tracks;
    const results = await trackService.repo.findMany({
      where: {
        userId: args.targetUserId,
        OR: [{ name: { contains: artist.name } }, { artistName: artist.name }],
      },
    });
    if (results.length === 0) return sendNoDataEmbed(message);

    results.sort((a, b) => b.plays - a.plays);

    const tracks: TopList[] = [];

    results.forEach((t) => {
      tracks.push({
        name: t.name,
        playcount: t.plays,
        url: `https://www.last.fm/music/${encodeString(
          t.artistName
        )}/_/${encodeString(t.name)}`,
      });
    });

    const embed = convertTopStatsToEmbed(
      user,
      tracks.slice(0, 10),
      `${user.lastFMName} top tracks for ${artist.name} with features`
    );

    if (!embed) return message.reply('No data found!');
    message.channel.send({ embeds: [embed] });
    // console.log(results);
  }
}

function encodeString(s: string) {
  return s.split(' ').join('+');
}

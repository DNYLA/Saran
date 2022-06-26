import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo, fetchArtistInfo } from '../../api/lastfm';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command from '../../utils/base/command';
import { setCachedPlays } from '../../utils/database/redisManager';
import { getUser } from '../../utils/database/User';
import {
  fetchRecentTrackInfo,
  getTargetUserId,
  SearchType,
} from '../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../utils/types';

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
      args: [
        {
          parse: MentionUserId,
          default: SelfUserId,
        },
      ],
    });
  }

  async run(message: Message, args: string[]) {
    const userId = args[0];
    const user = await getUser(userId);
    const username = user.lastFMName;
    let donatorEmbed = false;

    // if (!user.lastFMName) return

    if (!args.includes('alt') && user.donator) {
      donatorEmbed = true;
    }

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

    console.log(track);
    console.log(recentTrack);

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
    if (donatorEmbed) {
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
    }

    try {
      let messageEmbed;
      if (!donatorEmbed)
        messageEmbed = new MessageEmbed()
          .setColor('#4a5656')
          .setAuthor({
            name: user.lastFMName,
            url: `https://www.last.fm/user/${user.lastFMName}`,
            iconURL:
              'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
          })
          .setThumbnail(recentTrack.image[3]['#text'])
          .addFields(
            // GenerateField('Track', value, true)
            {
              name: 'Track',
              value: `[${trackName}](${recentTrack.url})`,
              inline: true,
            },
            {
              name: 'Artist',
              value: `[${artistName}](${artistUrl})`,
              inline: true,
            }
          )
          .setFooter({
            text: `Playcount: ${track ? track.userplaycount : 0}  ∙ Album: ${
              recentTrack.album['#text']
            }`,
          });
      else
        messageEmbed = new MessageEmbed()
          .setColor('#2F3136')
          // .setTitle(recentTrack.name)
          // .setURL(recentTrack.url)
          .setAuthor({
            name: user.lastFMName,
            url: `https://www.last.fm/user/${user.lastFMName}`,
            iconURL:
              'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
          })
          .setThumbnail(recentTrack.image[3]['#text'])
          .setDescription(description)
          .setFooter({
            text: `Total Scrobbles: ${
              userInfo?.total ?? 0
            }  ∙ Global Plays: ${globalTrackplays}`,
          });
      const npMessage = await message.channel.send({
        embeds: [messageEmbed],
      });
      npMessage.react('987085166285553715');
      npMessage.react('987085556733321247');
    } catch (err) {
      message.reply('Unable to display track! Try playing another one');
      console.log(err);
    }
  }
}

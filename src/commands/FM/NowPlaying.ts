import { Message, MessageEmbed } from 'discord.js';
import { fetchAlbumInfo, fetchArtistInfo } from '../../api/lastfm';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
import { MentionUserId, SelfUserId } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { setCachedPlays } from '../../utils/database/redisManager';
import { SaranUser } from '../../utils/database/User';
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
    const user = await new SaranUser(args.targetUserId).fetch();
    const username = user.info.lastFMName;
    let donatorEmbed = false;

    // if (!user.lastFMName) return

    // if !args.includes('alt') &&
    if (user.info.donator) {
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
      } = await fetchRecentTrackInfo(user.info.lastFMName);
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
      user.info.lastFMName,
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
          // .setColor('#4a5656')
          .setColor('#0a090b')
          .setAuthor({
            name: user.info.lastFMName,
            url: `https://www.last.fm/user/${user.info.lastFMName}`,
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
          // .setColor('#2F3136')
          .setColor('#0a090b')
          // .setCo
          // .setTitle(recentTrack.name)
          // .setURL(recentTrack.url)
          .setAuthor({
            name: user.info.lastFMName,
            url: `https://www.last.fm/user/${user.info.lastFMName}`,
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

import { Message, MessageEmbed } from 'discord.js';
import UsernameCheck from '../../checks/UsernameCheck';
import NoUsernameSet from '../../hooks/NoUsernameSet';
import StartTyping from '../../hooks/StartTyping';
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
    });
  }

  async run(message: Message, args: string[]) {
    const userId = getTargetUserId(message, args, true);
    const user = await getUser(userId);

    let normalEmbed = true;

    if (args.includes('alt')) {
      normalEmbed = false;
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

    if (!track || !recentTrack)
      return message.reply('Unable to display this track!');

    await setCachedPlays(
      user.lastFMName,
      `${track.name}-${track.artist.name}`,
      track.userplaycount,
      SearchType.Track
    );

    try {
      let messageEmbed;
      if (normalEmbed)
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
              value: `[${recentTrack.name}](${recentTrack.url})`,
              inline: true,
            },
            {
              name: 'Artist',
              value: `[${track.artist.name}](${track.artist.url})`,
              inline: true,
            }
          )
          .setFooter({
            text: `Playcount: ${track.userplaycount}  ∙ Album: ${recentTrack.album['#text']}`,
          });
      else
        messageEmbed = new MessageEmbed()
          .setColor('#4a5656')
          .setTitle(recentTrack.name)
          .setURL(recentTrack.url)
          .setAuthor({
            name: user.lastFMName,
            url: `https://www.last.fm/user/${user.lastFMName}`,
            iconURL:
              'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
          })
          .setThumbnail(recentTrack.image[3]['#text'])
          .addFields(
            {
              name: `[link](http://example.com)`,
              value: `[${track.artist.name}](${track.artist.url}) ∙ [${track.album.title}](${track.album.url})`,
              inline: true,
            },
            {
              name: 'Plays',
              value: `${track.userplaycount}`,
              inline: true,
            }
          )
          .setFooter({
            text: `Jungaal has ${userInfo.total}  ∙ Album: ${recentTrack.album['#text']}`,
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

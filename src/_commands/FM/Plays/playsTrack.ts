import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import {
  fetchRecentTracks,
  fetchSearchTrack,
  fetchTrackInfo,
} from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import Command2 from '../../../utils/base/Command2';
import DiscordClient from '../../../utils/client';
import { getUser, updateUserById } from '../../../utils/database/User';
import {
  fetchRecentTrackInfo,
  fetchSearchTrackInfo,
  getTargetUserId,
} from '../../../utils/fmHelpers';
import { PartialUser, Track } from '../../../utils/types';

export default class PlaysTrack extends Command2 {
  constructor() {
    super('lf playst', {
      aliases: ['lf playstrack', 'lf pt', 'lf tp', 'lf ptrack'],
      requirments: {
        custom: UsernameCheck,
      },
      hooks: {
        preCommand: StartTyping,
        postCheck: NoUsernameSet,
      },
      invalidUsage:
        'Usage: ,lf playst <trackname>(Optional) | <artistname>(Optional)',
    });
  }

  async run(message: Message, args: string[]) {
    const user = await getUser(getTargetUserId(message, args, true));

    let trackName: string;
    let artistName = null;

    if (args.length > 0) {
      trackName = args.join(' ');

      const trackDetails = trackName.split(' | ');
      if (trackDetails.length > 0) {
        trackName = trackDetails[0];
        artistName = trackDetails[1];
      }
    }

    let track: Track;
    let userInfo: PartialUser;

    if (!trackName) {
      const trackInfo = await fetchRecentTrackInfo(user.lastFMName);
      track = trackInfo.track;
      userInfo = trackInfo.user;
    } else {
      track = await fetchSearchTrackInfo(
        user.lastFMName,
        trackName,
        artistName
      );
    }

    if (!track) return message.reply('No track found!');

    // const messageEmbed = CreateEmbed({
    //   color: '#fff',
    //   author: GetAuthorDetails(message, user),
    //   thumbnail: '',
    // });

    let imageUrl;

    if (track.album) {
      imageUrl = track.album.image[3]['#text'];
    }

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#2F3136')
        .setTitle(imageUrl ? '\u200B' : '')
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${track.userplaycount} plays** on track **[${track.name}](${track.url})**`
        );

      message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

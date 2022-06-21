import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed } from 'discord.js';
import {
  fetchRecentTracks,
  fetchSearchTrack,
  fetchTrackInfo,
} from '../../api/lastfm';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { updateUserById } from '../../utils/database/User';
import { getUserFromMessage, hasUsernameSet } from '../../utils/fmHelpers';
import { PartialUser, RecentTrack, Track } from '../../utils/types';

export default class SetUsername extends Command {
  constructor() {
    super('lf playst', 'LastFM', [
      'lf playstrack',
      'lf pt',
      'lf tp',
      'lf ptrack',
    ]);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    const user = await getUserFromMessage(message);
    if (user.id !== message.author.id) args.shift();
    if (!hasUsernameSet(message, user)) return;

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

    let recentTrack: RecentTrack;
    let track: Track;
    let userInfo: PartialUser;

    if (!trackName) {
      try {
        const { data: res } = await fetchRecentTracks(user.lastFMName, 1);
        if (res.recenttracks.length == 0)
          return message.channel.send(
            'No data to display! Listen to a track before using this command.'
          );

        recentTrack = res.recenttracks.track[0];
        userInfo = res.recenttracks['@attr'];

        console.log(userInfo);
      } catch (err) {
        console.log(err);
        return message.channel.send('Unable to process request');
      }

      try {
        const { data } = await fetchTrackInfo(
          user.lastFMName,
          recentTrack.name,
          recentTrack.artist['#text']
        );
        track = data.track;
      } catch (err) {
        console.log(err);
        return message.channel.send('Unable to process request');
      }
    } else {
      try {
        const { data } = await fetchSearchTrack(
          user.lastFMName,
          trackName,
          artistName
        );
        console.log(data);
        const trackSearch: any = data.results.trackmatches.track;

        const { data: trackData } = await fetchTrackInfo(
          user.lastFMName,
          trackSearch[0].name,
          trackSearch[0].artist
        );
        console.log(trackData);
        track = trackData.track;
      } catch (err) {
        console.log(err);
        return message.channel.send('No track found!');
      }
    }

    console.log(track);

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
        // .setAuthor({
        //   name: `${user.lastFMName}`,
        //   url: `https://www.last.fm/user/${user.lastFMName}`,
        //   iconURL:
        //     'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        // })
        // .setAuthor({
        //   name: message.member.displayName,
        //   // url: `https://www.last.fm/user/${user.lastFMName}`,
        //   iconURL: message.member.displayAvatarURL({ dynamic: true }),
        // })
        .setTitle(imageUrl ? '\u200B' : '')
        // .setTitle(
        //   `${user.lastFMName}  **has a total of ${track.userplaycount} plays on track ${recentTrack.name} by ${track.artist.name}**`
        // )
        // .setTitle(
        //   `Jungaal has a total of **${track.userplaycount} plays** on track **[${recentTrack.name}](${recentTrack.url})**`
        // )
        .setThumbnail(imageUrl)
        .setDescription(
          `**${user.lastFMName}** has a total of **${track.userplaycount} plays** on track **[${track.name}](${track.url})**`
        );
      // .setFooter({
      //   text: `Artist: ${track.artist.name} ∙ Album: ${track.album.title} ∙ Requested by ${message.member.displayName}`,
      // });

      message.channel.send({
        embeds: [messageEmbed],
      });
    } catch (err) {
      message.reply('Unable to display track! Try checking another one');
      console.log(err);
    }
  }
}

import { PrismaClient } from '@prisma/client';
import { Message, MessageEmbed, Permissions } from 'discord.js';
import { getRecentTracks, getTrackInfo } from '../../api/lastfm';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { RecentTrack, Track } from '../../utils/types';

const prisma = new PrismaClient();

export default class NowPlaying extends Command {
  constructor() {
    super('np', 'LastFM', ['']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();

    let user = await prisma.user.findUnique({
      where: { id: message.author.id },
    });

    if (!user) {
      user = await prisma.user.create({ data: { id: message.author.id } });
    }

    if (!user.lastFMName) {
      const usernameNotSetEmbed = new MessageEmbed()
        .setColor('#cb0f0f')
        .setDescription(`Set your lastFM username by doing ,lfset <username>`);

      return message.reply({ embeds: [usernameNotSetEmbed] });
    }

    // const { data } = await axios.get(
    //   `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&limit=1&api_key=07bcd9b97479a2724d17829809ac0d83&format=json`
    // );

    // const { data } = await getRecentTracks(username, 1);

    let recentTrack: RecentTrack;

    try {
      const { data: res } = await getRecentTracks(user.lastFMName, 1);

      if (res.recenttracks.length == 0) return;

      recentTrack = res.recenttracks.track[0];
    } catch (err) {
      return message.channel.send('Unable to process request');
    }

    if (!recentTrack)
      return message.channel.send(
        'No data to display! Listen to a track before using this command.'
      );

    let track: Track;

    try {
      const { data } = await getTrackInfo(
        user.lastFMName,
        recentTrack.artist['#text'],
        recentTrack.name
      );
      track = data.track;
    } catch (err) {
      return message.channel.send('Unable to process request');
    }

    try {
      const messageEmbed = new MessageEmbed()
        .setColor('#4a5656')
        .setAuthor({
          name: user.lastFMName,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setThumbnail(recentTrack.image[3]['#text'])
        .addFields(
          {
            name: 'Track',
            value: `[${track.name}](${track.url})`,
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

      const npMessage = await message.channel.send({
        embeds: [messageEmbed],
      });
      npMessage.react('987085166285553715');
      npMessage.react('987085556733321247');
    } catch (err) {
      message.reply('Unable to display track! Try playing another one');
      console.log(err);
    }

    // infoMessage.react('fire');
  }
}

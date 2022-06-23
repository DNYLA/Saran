import { Message, MessageEmbed } from 'discord.js';
import { fetchArtistInfo } from '../../../api/lastfm';
import UsernameCheck from '../../../checks/UsernameCheck';
import NoUsernameSet from '../../../hooks/NoUsernameSet';
import StartTyping from '../../../hooks/StartTyping';
import Command from '../../../utils/base/command';
import {
  getCachedPlays,
  setCachedPlays,
} from '../../../utils/database/redisManager';
import { getGuildUsers, getUser } from '../../../utils/database/User';
import {
  fetchRecentArtistInfo,
  getTargetUserId,
  SearchType,
} from '../../../utils/fmHelpers';

export default class WhoKnows extends Command {
  constructor() {
    super('lf wk', {
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
    const user = await getUser(getTargetUserId(message, args, true));
    const guildUsers = await getGuildUsers(message.guildId);

    if (!guildUsers || guildUsers.length === 0)
      return message.reply('Server hasnt been indexed use ,lf index');

    const { artist, recentTrack } = await fetchRecentArtistInfo(
      user.lastFMName
    );

    if (!artist || !recentTrack)
      return message.reply(
        'The current track you are listening to is not trackable!'
      );

    let sum = 0;
    let description = '';
    const wkInfo = [];
    for (let i = 0; i < guildUsers.length; i++) {
      const member = guildUsers[i];
      if (!member.lastFMName) continue; //This shouldnt occur but checked anyways
      try {
        const cachedPlays = await getCachedPlays(
          member.lastFMName,
          artist.name,
          SearchType.Artist
        );

        const item = {
          id: member.id,
          fmName: member.lastFMName,
        };

        if (cachedPlays) {
          wkInfo.push({ ...item, plays: cachedPlays });
          continue;
        }

        const artistInfo = await fetchArtistInfo(
          member.lastFMName,
          artist.name
        );
        if (!artistInfo) continue;
        const fetchedPlays = artistInfo.stats.userplaycount;
        if (fetchedPlays === 0) continue;

        wkInfo.push({ ...item, plays: fetchedPlays });
        await setCachedPlays(
          member.lastFMName,
          artist.name,
          fetchedPlays,
          SearchType.Artist
        );
      } catch (err) {
        console.log(err);
      }
    }

    wkInfo.sort((a, b) => b.plays - a.plays).slice(0, 10);

    for (let i = 0; i < wkInfo.length; i++) {
      const { id, fmName, plays } = wkInfo[i];
      console.log(id);
      try {
        const discordUser = await message.client.users.fetch(id);
        if (!discordUser) return;
        const formatted = `${discordUser.username}#${discordUser.discriminator}`;
        sum += Number(plays);
        description += `**${i + 1}. [${
          i === 0 ? '👑' : ''
        } ${formatted}](https://www.last.fm/user/${fmName})** has **${plays}** plays\n`;
      } catch (err) {
        console.log(err);
      }
    }
    // .map(({ id, fmName, plays }, i) => {});

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.lastFMName}`,
          url: `https://www.last.fm/user/${user.lastFMName}`,
          iconURL:
            'https://lastfm.freetls.fastly.net/i/u/avatar170s/a7ff67ef791aaba0c0c97e9c8a97bf04.png',
        })
        .setTitle(`Top Listeners for ${artist.name}`)
        .setDescription(description)
        .setFooter({
          text: `Total Listeners: ${wkInfo.length} ∙ Total Plays: ${sum}`,
        });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

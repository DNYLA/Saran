import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getGuildUser, getGuildUsersCustom } from '../../utils/database/User';

export default class RankLeaderboard extends Command {
  constructor() {
    super('leaderboard', {
      aliases: ['lb'],
      invalidUsage: `Do ,lb`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message) {
    const client = message.client as DiscordClient;

    const data = await client.database.guild(message.guildId);
    data.fetch;
    const users = await getGuildUsersCustom(message.guildId);

    // const user = users.find((u) => u.userId === message.member.id);
    const user = await message.guild.members.fetch(message.author.id);
    const userFrom = await message.client.users.fetch(message.author.id);
    let description = '';

    for (let i = 0; i < users.length; i++) {
      const { userId, xp } = users[i];
      if (xp === 0) continue;
      try {
        const discordUser = await message.client.users.fetch(userId);
        const formatted = `${discordUser.username}#${discordUser.discriminator}`;

        description += `**${i + 1}. ${
          i === 0 ? '👑' : ''
        } ${formatted}** has **${xp}** xp\n`;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const embed = new MessageEmbed()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.displayName}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTitle(`Rank Leaderboard for ${message.guild.name}`)
        .setDescription(description)
        .setTimestamp();
      // .setFooter({
      //   text: `Total Listeners: ${wkInfo.length} ∙ Total Plays: ${sum}`,
      // });

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }

    // if (args.length === 0) return message.reply('Provide a URL to scrape!');
    // const url = 'https://www.instagram.com/p/Cdc02LTD0Fo/';

    // const html = await axios.get(url);
    // console.log(html);
    // // calls cheerio to process the html received
    // const $ = cheerio.load(html.data);
    // // searches the html for the videoString
    // const videoString = $("meta[property='og:video']").attr('content');
    // // returns the videoString

    // console.log(videoString);
    // // message.reply(videoString);
  }
}

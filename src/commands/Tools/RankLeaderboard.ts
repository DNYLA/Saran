import { Message, MessageEmbed } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

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
    const users = await client.db.guildUsers.repo.findMany({
      where: { serverId: message.guildId },
      include: { user: true },
      take: 10,
      orderBy: { xp: 'desc' },
    });

    // const user = users.find((u) => u.userId === message.member.id);
    const user = await message.guild.members.fetch(message.author.id);
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

      return message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

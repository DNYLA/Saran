import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { prisma } from '../../services/prisma';
import Command from '../../utils/base/command';

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
    const users = await prisma.guildUser.findMany({
      where: { serverId: message.guildId },
      take: 10,
      orderBy: { level: 'desc' },
    });

    // const user = users.find((u) => u.userId === message.member.id);
    const user = await message.guild.members.fetch(message.author.id);
    let description = '';

    for (let i = 0; i < users.length; i++) {
      const { userId, level } = users[i];
      if (level === 0) continue;
      try {
        const discordUser = await message.client.users.fetch(userId);
        const formatted = `${discordUser.username}#${discordUser.discriminator}`;

        description += `**${i + 1}. ${
          i === 0 ? '👑' : ''
        } ${formatted}** level **${level}**\n`;
      } catch (err) {
        console.log(err);
      }
    }

    try {
      const embed = new EmbedBuilder()
        .setColor('#2F3136')
        .setAuthor({
          name: `Requested by ${user.displayName}`,
          iconURL: user.displayAvatarURL(),
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

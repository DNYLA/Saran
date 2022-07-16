import { Prisma } from '@prisma/client';
import { Message, MessageEmbed, Role } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { MentionIdOrArg, RoleMentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';
import DiscordClient from '../../utils/client';

export default class Levels extends Command {
  constructor() {
    super('levels', {
      invalidUsage: `Do ,levels`,
      hooks: {
        preCommand: StartTyping,
      },
    });
  }

  async run(message: Message, args: { roleId: string }) {
    const client = message.client as DiscordClient;
    const guild = await message.guild.fetch();
    const roles = await guild.roles.fetch();
    let role: Role;
    const db = client.db;

    const levels = await db.levels.repo.findMany({
      where: { serverId: guild.id },
    });
    console.log(levels);

    if (!levels) return message.reply('No levels for this guild');

    let description = '';
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      description += `<@&${level.roleId}>: ${level.level}`;
    }

    const embed = new MessageEmbed()
      .setColor('#2F3136')
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL({ dynamic: true }),
      })
      .setTitle(`Levels Overview`)
      .setDescription(description)
      .setFooter({
        text: `Total Levels: ${levels.length}`,
      });

    return message.channel.send({ embeds: [embed] });
  }
}

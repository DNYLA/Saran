import { Message, EmbedBuilder } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { prisma } from '../../services/prisma';
import Command from '../../utils/base/command';
import { CommandOptions } from '../../utils/types';

export default class LevelsCommand extends Command {
  constructor(subcommand: string, options?: CommandOptions) {
    super(
      'levels',
      options ?? {
        invalidUsage: `Do ,levels`,
        isSubcommand: true,
        hooks: {
          preCommand: StartTyping,
        },
      },
      subcommand
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async run(message: Message, args: unknown): Promise<Message | void> {
    const guild = await message.guild.fetch();
    await guild.roles.fetch();

    const levels = await prisma.levels.findMany({
      where: { serverId: guild.id },
    });

    if (!levels) return message.reply('No levels for this guild');

    let description = '';
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      description += `<@&${level.roleId}>: ${level.level}\n`;
    }

    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setAuthor({
        name: guild.name,
        iconURL: guild.iconURL(),
      })
      .setTitle(`Levels Overview`)
      .setDescription(description)
      .setFooter({
        text: `Total Levels: ${levels.length}`,
      });

    return message.channel.send({ embeds: [embed] });
  }
}

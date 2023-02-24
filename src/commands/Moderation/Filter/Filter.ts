import { EmbedBuilder, Message } from 'discord.js';
import StartTyping from '../../../hooks/StartTyping';
import { fetchGuild } from '../../../services/database/guild';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { buildEmbed } from '../../../utils/embedbuilder';
import { CommandOptions } from '../../../utils/types';

export default class Filter extends Command {
  constructor() {
    super('filters', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      hooks: {
        postCheck: StartTyping,
      },
    });
  }

  async run(message: Message) {
    // return message.channel.send({ embeds: [buildEmbed(data)] });
    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      .setAuthor({
        name: `Filters in ${message.guild.name}`,
        iconURL: message.guild.iconURL(),
      })
      // .setTitle(`Filters in ${message.guild.name}`)
      .setDescription('**No Filters found!**')
      .setFooter({
        text: `run ,filter add word to create a new filter.`,
      });
    const config = await fetchGuild(message.guildId);
    if (config.filters.length === 0) {
      return message.channel.send({ embeds: [embed] });
    }

    let description = '';
    //Hard Coded for now will re-work to store who adds a filter and what to do.
    const response = 'Jail';
    const addedBy = await message.client.users.fetch(message.guild.ownerId);

    config.filters.forEach((filter) => {
      description += `**${filter}** - Added By **${addedBy.username}#${addedBy.discriminator}** (${response})\n`;
    });

    embed.setDescription(description);

    return message.channel.send({ embeds: [embed] });
  }
}

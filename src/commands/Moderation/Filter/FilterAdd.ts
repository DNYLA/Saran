import { EmbedBuilder, Message } from 'discord.js';
import StartTyping from '../../../hooks/StartTyping';
import { fetchGuild, updateGuild } from '../../../services/database/guild';
import { ImageUrlOrAttachment, LowerCase } from '../../../utils/argsparser';
import Command, { ArgumentTypes } from '../../../utils/base/command';
import { buildEmbed } from '../../../utils/embedbuilder';
import Filter from './Filter';

export default class FilterAdd extends Command {
  constructor() {
    super('filteradd', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: 'Please Do ,filter add word',
      hooks: {
        postCheck: StartTyping,
      },
      arguments: [
        {
          name: 'word',
          type: ArgumentTypes.FULL_SENTANCE,
          parse: LowerCase,
        },
      ],
    });
  }

  async run(message: Message, args: { word: string }) {
    // return message.channel.send({ embeds: [buildEmbed(data)] });
    const embed = new EmbedBuilder()
      .setColor('#2F3136')
      // .setTitle(`Filters in ${message.guild.name}`)
      .setDescription(`Successfully Added Filter **${args.word}**`);

    const config = await fetchGuild(message.guildId);

    const newFilters = [...config.filters, args.word];

    await updateGuild(message.guildId, {
      filters: [...new Set(newFilters)],
    });

    return message.channel.send({ embeds: [embed] });
  }
}

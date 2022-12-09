import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command, { ArgumentTypes } from '../../utils/base/command';
import { buildEmbed } from '../../utils/embedbuilder';

export default class Ban extends Command {
  constructor() {
    super('embed', {
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,embed <embed>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: [
        {
          name: 'embed',
          type: ArgumentTypes.FULL_SENTANCE,
        },
      ],
    });
  }

  async run(message: Message, args: { embed: string }) {
    const embed = buildEmbed(args.embed);
    // return message.channel.send({ embeds: [buildEmbed(data)] });
    return message.channel.send({ embeds: [embed] });
  }
}

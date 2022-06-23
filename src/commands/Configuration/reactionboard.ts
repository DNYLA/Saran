import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';

const prisma = new PrismaClient();

export default class SetReactionBoardChannel extends Command {
  constructor() {
    super('reactionboard', {
      aliases: ['rb'],
      requirments: {
        permissions: {
          administrator: true,
        },
      },
      invalidPermissions: 'You must be admin to use this!',
      invalidUsage: `Do ,rb <#channel> <reaction_limit>`,
      hooks: {
        preCommand: StartTyping,
      },
      arguments: {
        required: true,
        minAmount: 2,
      },
    });
  }

  async run(message: Message, args: string[]) {
    const boardChannel = message.mentions.channels.first();
    const client = message.client as DiscordClient;
    if (!boardChannel)
      return message.reply('Provide a channel with the message');

    let reactionLimit = NaN;
    try {
      reactionLimit = parseInt(args[1]);
      if (isNaN(reactionLimit)) {
        return message.channel.send(
          'Provide a number for the 2nd paramter. ,rb <#channel> <reaction_limit>'
        );
      }

      if (reactionLimit <= 0) {
        return message.channel.send('Provide a number greater than 0.');
      }
    } catch (err) {
      return message.channel.send(
        'Provide a number for the 2nd paramter. ,rb <#channel> <reaction_limit>'
      );
    }

    try {
      const config = await prisma.guildConfig.update({
        where: { id: message.guildId },
        data: {
          reactionBoardChannel: boardChannel.id,
          reactionBoardLimit: reactionLimit,
        },
      });
      client.setConfig(config);
      message.channel.send(`Successfully set ${args[0]} as reaction board.`);
    } catch (err) {
      message.reply(
        'An Error occured when attempting to set the reaction board channel.'
      );
    }
  }
}

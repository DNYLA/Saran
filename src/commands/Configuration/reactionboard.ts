import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import StartTyping from '../../hooks/StartTyping';
import { ChannelMentionIdOrArg } from '../../utils/argsparser';
import Command, { ArgumentTypes } from '../../utils/base/command';

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
      arguments: [
        {
          parse: ChannelMentionIdOrArg,
          name: 'channelId',
          type: ArgumentTypes.SINGLE,
        },
        {
          name: 'limit',
          type: ArgumentTypes.INTEGER, //Add Integer
          optional: true,
        },
      ],
    });
  }

  async run(message: Message, args: { channelId: string; limit: number }) {
    const boardChannel = await message.guild.channels
      .fetch(args.channelId)
      .catch(console.error);

    if (!boardChannel) return message.reply('Invalid channel provided');

    if (args.limit <= 0) {
      return message.reply('Provide a number greater than 0!');
    }

    try {
      await prisma.guildConfig.update({
        where: { id: message.guildId },
        data: {
          reactionBoardChannel: boardChannel.id,
          reactionBoardLimit: args.limit,
        },
      });
      message.channel.send(
        `Successfully set <#${args.channelId}> as reaction board with a minimum of ${args.limit} :sob: reactions.`
      );
    } catch (err) {
      message.reply(
        'An Error occured when attempting to set the reaction board channel.'
      );
    }
  }
}

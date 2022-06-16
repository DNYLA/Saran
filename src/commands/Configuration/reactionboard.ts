import { PrismaClient } from '@prisma/client';
import { Message } from 'discord.js';
import Command from '../../utils/base/command';
import DiscordClient from '../../utils/client';
import { getIdFromTag, MessageType } from '../../utils/helpers';

const prisma = new PrismaClient();

export default class SetReactionBoardChannel extends Command {
  constructor() {
    super('reactionboard', 'LastFM', ['rb']);
  }

  async run(client: DiscordClient, message: Message, args: string[]) {
    message.channel.sendTyping();
    console.log(args);

    if (args.length != 2) {
      return message.channel.send(
        'Provide the correct paramters. ,rb <#channel> <reaction_limit>'
      );
    }

    const boardChannel = message.mentions.channels.first();
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

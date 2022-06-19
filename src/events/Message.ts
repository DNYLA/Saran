import { PrismaClient } from '@prisma/client';
import { Guild, Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { getUser } from '../utils/database/User';
import { getArgsFromMsg } from '../utils/helpers';
const prisma = new PrismaClient();

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;

    const userConfig = await getUser(message.author.id);
    let config;
    try {
      config = await prisma.guildConfig.findUnique({
        where: { id: message.guildId },
      });

      if (!config) {
        console.log('Does not exist');
        config = await prisma.guildConfig.create({
          data: { id: message.guildId },
        });
      }
    } catch (err) {
      message.reply('Undiagnosable Error occured');
      return;
    }

    client.setConfig(config);

    if (userConfig.lastFMTag) {
      if (
        message.content
          .toLowerCase()
          .startsWith(userConfig.lastFMTag.toLowerCase())
      ) {
        const command = client.commands.get('np');
        const args = message.content
          .slice(userConfig.lastFMName.length)
          .split(/ +/);

        if (command) {
          try {
            command.run(client, message, args, config);
          } catch (err) {
            message.channel.send(
              'There was an error when attempting to execute this command'
            );
          }
        }
      }
    }

    if (message.content.startsWith(config.prefix)) {
      // If message is only <Prefix>
      if (message.content === config.prefix) {
        return;
      }

      //Re-Write getArgsFromMsg to concat modules which have space names.
      const { commandName, args } = getArgsFromMsg(
        message.content,
        config.prefix.length
      );

      const command = client.commands.get(commandName.toLowerCase());

      if (command) {
        try {
          command.run(client, message, args, config);
        } catch (err) {
          message.channel.send(
            'There was an error when attempting to execute this command'
          );
        }
      } else if (
        (!command && commandName.startsWith('lf')) ||
        commandName.startsWith('fm')
      ) {
        let newCommandName = `${commandName} ${args.shift()}`;
        const newCommand = client.commands.get(newCommandName.toLowerCase());

        console.log(newCommandName);

        if (!newCommand) return;
        try {
          newCommand.run(client, message, args, config);
        } catch (err) {
          message.channel.send(
            'There was an error when attempting to execute this command'
          );
        }
      }
    }
  }
}

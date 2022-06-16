import { PrismaClient } from '@prisma/client';
import { Guild, Message } from 'discord.js';
import Event from '../utils/Base/event';
import DiscordClient from '../utils/client';
import { getArgsFromMsg } from '../utils/helpers';
const prisma = new PrismaClient();

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;

    let config = await prisma.guildConfig.findUnique({
      where: { id: message.guildId },
    });

    if (!config) {
      console.log('Does not exist');
      config = await prisma.guildConfig.create({
        data: { id: message.guildId },
      });
    }
    client.setConfig(config);

    // let { data: guildConfig } = await getGuildConfig(guildId);

    // if (!guildConfig) {
    //   guildConfig = (await createGuildConfig(guildId, message.guild.name)).data;
    // }

    // if (!guildConfig) {
    //   return; //After Two Tries move on.
    // }

    if (message.content.startsWith(config.prefix)) {
      // If message is only <Prefix>
      if (message.content === config.prefix) {
        return;
      }

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
      }
    }
  }
}

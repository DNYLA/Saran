import { PrismaClient } from '@prisma/client';
import { Guild, Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';
import { SaranGuild } from '../utils/database/Guild';
import { createGuildMember, getUser, SaranUser } from '../utils/database/User';
import { getArgsFromMsg, mentionUser } from '../utils/helpers';
const prisma = new PrismaClient();

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    const member = await message.guild.members.fetch(message.author.id);
    const guildd = await new SaranGuild(message.guildId).fetch();
    const gUser = await guildd.fetchUser(message.author.id);
    const user = await new SaranUser(message.author.id).fetch();

    await Promise.all(
      message.mentions.members.map(async (member) => {
        const mentionedUser = await new SaranUser(member.id).fetch();

        if (!mentionedUser.info.afkTime) return;

        const timeAfk = moment(mentionedUser.info.afkTime).fromNow();
        const reason = mentionedUser.info.afkMessage ?? '😴';

        const afkembed = new MessageEmbed()
          .setColor('#49b166')
          .setDescription(
            `😴 <@${mentionedUser.info.id}> has been AFK since ${timeAfk}: ${reason}`
          );

        await message.channel.send({ embeds: [afkembed] });
      })
    );

    if (user.info.afkTime) {
      const formattedTime = 'time';
      const afkembed = new MessageEmbed()
        .setColor('#49b166')
        .setDescription(
          `Welcome <@${
            message.author.id
          }> you were away for ${formattedTime}: ${user.info.afkMessage ?? ''}`
        );
      await message.channel.send({ embeds: [afkembed] });
      await user.update({ afkMessage: null, afkTime: null });
    }
    // guildd.updateMember(member, {}, { xp: { increment: 5 } });
    const guildUser = await createGuildMember(
      member,
      {},
      { xp: { increment: 5 } }
    );
    if (message.content.includes('v/s')) {
      await message.react('◀️');
      await message.react('▶️');
    } else if (message.content.includes('y/n')) {
      await message.react('🔼');
      await message.react('🔽');
    }

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
    try {
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
              command.execute(client, message, args);
            } catch (err) {
              message.channel.send(
                'There was an error when attempting to execute this command'
              );
            }
          }
        }
      }
    } catch (err) {
      message.reply('failed to execute this retardic ahh command.');
      return;
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
          command.execute(client, message, args);
        } catch (err) {
          console.log(err);
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
          newCommand.execute(client, message, args);
        } catch (err) {
          message.channel.send(
            'There was an error when attempting to execute this command'
          );
        }
      }
    }
  }
}

import { GuildConfig } from '@prisma/client';
import { EmbedBuilder, Message } from 'discord.js';
import {
  fetchGuildUser,
  updateGuildUser,
} from '../../services/database/guildUser';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { getArgsFromMsg } from '../../utils/helpers';
import prisma from '../../services/prisma';
import { fetchGuild, updateGuild } from '../../services/database/guild';
import { fetchDatabaseUser } from '../../services/database/user';
import { CONSTANTS } from '../../utils/constants';
import { JailUser } from '../../commands/Moderation/Jail';
export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    // return await UnderMaintance(message);

    console.log(
      `Author: ${message.author.id} Id: ${message.id}; Guild: ${message.guild.name}-${message.guildId}`
    );
    const user = await fetchDatabaseUser(message.author.id);
    const config = await fetchGuild(message.guildId);
    const guildMember = await message.guild.members.fetch(message.author.id);
    if (config) {
      await updateGuild(message.guildId, {
        name: message.guild.name,
      });
    }

    if (!guildMember.permissions.has('Administrator') && config) {
      for (let i = 0; i < config.filters.length; i++) {
        const filter = config.filters[i];
        if (!message.content.includes(filter)) continue;
        const reason = 'Jailed for saying filtered word.';

        await JailUser(message, { mentionedUserId: message.author.id, reason });
        await message.delete();
        return;
      }
    }

    await handleLevelUp(client, message, config);

    if (!user) return;
    let messageCommand = message.content;

    //Replace custom lastfm tag with ,lf
    //Update to allow it to replace lf instead
    if (user.lastFMTag) {
      if (
        messageCommand.toLowerCase().startsWith(user.lastFMTag.toLowerCase())
      ) {
        messageCommand = messageCommand.toLowerCase(); //Lowercase doesnt matter when queerying for data only when inputting.
        messageCommand = messageCommand.replace(
          user.lastFMTag.toLowerCase(),
          `${config.prefix}np`
        );
      }
    }

    //Not a valid command
    if (!messageCommand.toLowerCase().startsWith(config.prefix.toLowerCase()))
      return;
    // If message is only <Prefix>
    if (messageCommand.toLowerCase() === config.prefix.toLowerCase()) return; //Command/message is only prefix: ;

    //Re-Write getArgsFromMsg to concat modules which have space names.
    const { commandName, args } = getArgsFromMsg(
      messageCommand,
      config.prefix.length
    );

    const command = client.commands.get(commandName.toLowerCase());
    if (!command) return; //Invalid Command

    try {
      if (process.env.DISABLED) {
        await message.reply(
          'To Continue Using Saran Bot invite the new bot using this link. When you invite the new bot please make sure the bot role is set to one of the highest in the server.\nhttps://discord.com/api/oauth2/authorize?client_id=1086495829214371930&permissions=8&scope=bot'
        );
        console.log(
          `Command?: ${command.getName()}; Author: ${
            message.author.username
          }; Guild: ${message.guild.name}`
        );
        return;
      }

      console.log(
        ` Command: ${command.getName()}; Author: ${
          message.author.username
        }; Guild: ${message.guild.name}`
      );
      await command.execute(client, message, args);
    } catch (err) {
      console.log(err);
      message.reply(
        'There was an error when attempting to execute this command'
      );
    }
  }
}

async function handleLevelUp(
  client: DiscordClient,
  message: Message,
  config: GuildConfig
) {
  const user = await fetchGuildUser(message.guildId, message.author.id);
  const addedLevel = user.level + 1;
  const xpMultiplier = Math.floor(15 * addedLevel);
  const xpThreshhold = Math.floor(
    500 * user.level * Math.floor(addedLevel * 0.5)
  );
  const newXp = Math.floor(user.xp + xpMultiplier);
  const guild = await message.guild.fetch();
  await guild.roles.fetch();
  const local = await guild.members.fetch(user.userId);

  if (newXp >= xpThreshhold) {
    //User Leveled Up
    await updateGuildUser(message.guildId, message.author.id, {
      xp: newXp - xpThreshhold,
      level: addedLevel,
    });

    //Check for new Roles
    const levels = await prisma.levels.findMany({
      where: { serverId: config.id, level: addedLevel },
    });

    if (levels) {
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];

        try {
          const role = guild.roles.cache.get(level.roleId);
          if (role) {
            await local.roles.add(role);
          }
        } catch (err) {
          console.log(err);
        }
      }
    }
  } else {
    await updateGuildUser(message.guildId, message.author.id, {
      xp: newXp,
    });
  }
}

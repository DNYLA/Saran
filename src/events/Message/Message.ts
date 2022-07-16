import { Message } from 'discord.js';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';
import { getArgsFromMsg } from '../../utils/helpers';

export default class MessageEvent extends Event {
  constructor() {
    super('messageCreate');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    const db = client.db;
    console.log(
      `Author: ${message.author.id} Id: ${message.id}; Guild: ${message.guild.name}-${message.guildId}`
    );
    const user = await db.users.findById(message.author.id);
    const config = await db.guilds.repo.findUnique({
      where: { id: message.guildId },
      include: { levels: true },
    });
    if (config) {
      await db.guilds.updateById(message.guildId, {
        name: message.guild.name,
      });
    }

    await handleLevelUp(client, message);

    if (!user) return;

    let messageCommand = message.content.toLowerCase();

    //Replace custom lastfm tag with ,lf
    //Update to allow it to replace lf instead
    if (user.lastFMTag)
      if (messageCommand.startsWith(user.lastFMTag.toLowerCase())) {
        messageCommand = messageCommand.replace(
          user.lastFMTag.toLowerCase(),
          `${config.prefix}np`
        );
      }

    //Not a valid command
    if (!messageCommand.startsWith(config.prefix)) return;
    // If message is only <Prefix>
    if (messageCommand === config.prefix) return; //Command/message is only prefix

    //Re-Write getArgsFromMsg to concat modules which have space names.
    const { commandName, args } = getArgsFromMsg(
      messageCommand,
      config.prefix.length
    );

    const command = client.commands.get(commandName.toLowerCase());
    console.log(commandName);

    if (!command) return; //Invalid Command

    try {
      command.execute(client, message, args);
    } catch (err) {
      console.log(err);
      message.channel.send(
        'There was an error when attempting to execute this command'
      );
    }
  }
  catch(err) {
    console.log(err);
  }
}

async function handleLevelUp(client: DiscordClient, message: Message) {
  const db = client.db;

  const config = await db.guilds.findById(message.guildId);
  const user = await db.guildUsers.findById(message.guildId, message.author.id);
  const addedLevel = user.level + 1;
  const xpMultiplier = Math.floor(15 * addedLevel);
  const xpThreshhold = Math.floor(
    500 * user.level * Math.floor(addedLevel * 0.5)
  );
  const newXp = Math.floor(user.xp + xpMultiplier);
  const guild = await message.guild.fetch();
  await guild.roles.fetch();
  const local = await guild.members.fetch(user.userId);

  console.log(xpThreshhold);
  console.log(xpMultiplier);
  if (newXp >= xpThreshhold) {
    //User Leveled Up
    await db.guildUsers.updateById(message.guildId, message.author.id, {
      xp: newXp - xpThreshhold,
      level: addedLevel,
    });

    //Check for new Roles
    const levels = await db.levels.repo.findMany({
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
    await db.guildUsers.updateById(message.guildId, message.author.id, {
      xp: newXp,
    });
  }
}

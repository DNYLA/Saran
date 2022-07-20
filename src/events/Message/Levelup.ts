import { Message } from 'discord.js';
import Event from '../../utils/base/event';
import DiscordClient from '../../utils/client';

export default class MessageEvent extends Event {
  constructor() {
    super('');
  }

  async run(client: DiscordClient, message: Message) {
    if (message.author.bot) return;
    // const db = client.db;

    // const config = await db.guilds.findById(message.guildId);
    // const user = await db.guildUsers.findById(
    //   message.guildId,
    //   message.author.id
    // );
    // const addedLevel = user.level + 1;
    // const xpMultiplier = Math.floor(15 * addedLevel);
    // const xpThreshhold = Math.floor(
    //   500 * user.level * Math.floor(addedLevel * 0.5)
    // );
    // const newXp = Math.floor(user.xp + xpMultiplier);
    // const guild = await message.guild.fetch();
    // await guild.roles.fetch();
    // const local = await guild.members.fetch(user.userId);

    // console.log(xpThreshhold);
    // if (newXp >= xpThreshhold) {
    //   //User Leveled Up
    //   await db.guildUsers.updateById(message.guildId, message.author.id, {
    //     xp: newXp - xpThreshhold,
    //     level: addedLevel,
    //   });

    //   //Check for new Roles
    //   const levels = await db.levels.repo.findMany({
    //     where: { serverId: config.id, level: addedLevel },
    //   });

    //   if (levels) {
    //     for (let i = 0; i < levels.length; i++) {
    //       const level = levels[i];

    //       try {
    //         const role = guild.roles.cache.get(level.roleId);
    //         if (role) {
    //           await local.roles.add(role);
    //         }
    //       } catch (err) {
    //         console.log(err);
    //       }
    //     }
    //   }
    // } else {
    //   await db.guildUsers.updateById(message.guildId, message.author.id, {
    //     xp: newXp,
    //   });
    // }
  }
}

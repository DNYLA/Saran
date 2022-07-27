import { GuildMember, Message } from 'discord.js';
import Event from '../utils/base/event';
import DiscordClient from '../utils/client';

export default class InteractionCreated extends Event {
  constructor() {
    super('guildMemberAdd');
  }

  async run(client: DiscordClient, member: GuildMember) {
    const db = client.db;
    const config = await db.guilds.findById(member.guild.id);
    const guild = await member.guild.fetch();

    if (!config.joinMessage || !config.joinMessageChannel) return;

    const channel = await guild.channels.fetch(config.joinMessageChannel);

    if (channel && channel.isTextBased()) {
      const re = new RegExp('{mention}', 'g');
      const parsed = config.joinMessage.replace(re, `<@${member.id}>`);
      channel.send({ content: parsed });
    } else {
      await db.guilds.updateById(guild.id, {
        joinMessage: null,
        joinMessageChannel: null,
      });
    }

    const user = await db.users.findGuildUser(member.id, member.guild.id);

    if (user.guilds.length === 0) {
      await db.guildUsers.create(member.id, member.guild.id);
      return;
    }

    try {
      await client.db.guildUsers.updateById(member.guild.id, member.id, {
        inactive: false,
      });
    } catch (err) {
      console.log(err);
      //Log this somewhere

      //User Probably Doesnt exist in database
    }

    //WasMuted?

    //WasJailed?
  }
}
